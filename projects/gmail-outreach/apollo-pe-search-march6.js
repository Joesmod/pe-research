const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Load the leads needing enrichment
const leads = JSON.parse(fs.readFileSync('leads-to-enrich-1206pm.json', 'utf8'));

async function searchApollo(firmName) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_name: firmName,
        person_titles: [
          'Managing Partner',
          'Managing Director',
          'General Partner',
          'CEO',
          'Chief Executive Officer',
          'COO',
          'Chief Operating Officer',
          'Partner',
          'Principal'
        ],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error searching ${firmName}:`, error.response?.data || error.message);
    return null;
  }
}

async function enrichLeads() {
  const results = [];
  
  for (let i = 0; i < Math.min(leads.length, 10); i++) {
    const lead = leads[i];
    console.log(`\n[${i + 1}/10] Searching Apollo for: ${lead.firm}`);
    
    const apolloData = await searchApollo(lead.firm);
    
    if (apolloData && apolloData.people && apolloData.people.length > 0) {
      const person = apolloData.people[0];
      
      results.push({
        row: lead.row,
        firm: lead.firm,
        contactName: person.name || '',
        title: person.title || '',
        email: person.email || '',
        linkedIn: person.linkedin_url || '',
        source: 'Apollo API',
        apolloConfidence: person.email_status || '',
        apolloOrgInfo: apolloData.organizations?.[0]?.name || ''
      });
      
      console.log(`✓ Found: ${person.name} - ${person.title}`);
      console.log(`  Email: ${person.email || 'N/A'} (${person.email_status || 'unknown'})`);
    } else {
      console.log(`✗ No results found`);
      results.push({
        row: lead.row,
        firm: lead.firm,
        contactName: '',
        title: '',
        email: '',
        linkedIn: '',
        source: 'Apollo - No results',
        apolloConfidence: '',
        apolloOrgInfo: ''
      });
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  
  fs.writeFileSync('apollo-enrichment-results-1206pm.json', JSON.stringify(results, null, 2));
  console.log(`\n\nSaved ${results.length} results to apollo-enrichment-results-1206pm.json`);
  
  // Print summary
  console.log('\n=== ENRICHMENT SUMMARY ===');
  const withEmail = results.filter(r => r.email && r.email !== '');
  console.log(`Found contacts: ${withEmail.length}/${results.length}`);
  console.log(`Verified emails: ${withEmail.filter(r => r.apolloConfidence === 'verified').length}`);
  console.log(`Likely emails: ${withEmail.filter(r => r.apolloConfidence === 'likely').length}`);
}

enrichLeads().catch(console.error);
