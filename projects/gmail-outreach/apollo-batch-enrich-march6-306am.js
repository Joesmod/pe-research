const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeople(firmName, titles = ['Partner', 'Managing Partner', 'Managing Director', 'CEO', 'CFO', 'COO', 'CTO', 'VP', 'Director']) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/search', {
      q_organization_name: firmName,
      person_titles: titles,
      per_page: 3  // Get top 3 results
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people) {
      return response.data.people.map(person => ({
        name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        organization: person.organization?.name || firmName
      })).filter(p => p.name && p.email);  // Only return if we have name and email
    }
    
    return [];
  } catch (error) {
    if (error.response?.status === 429) {
      console.error(`Rate limit hit for ${firmName}`);
    } else if (error.response?.status === 422) {
      console.error(`Invalid query for ${firmName}`);
    } else {
      console.error(`Error searching ${firmName}:`, error.response?.data?.message || error.message);
    }
    return [];
  }
}

async function enrichLeads() {
  // Load the leads that need enrichment
  const needsEnrichment = JSON.parse(fs.readFileSync('active-needs-march6-306am.json', 'utf8'));
  
  console.log(`Enriching ${Math.min(15, needsEnrichment.length)} leads using Apollo API...\n`);
  
  const enriched = [];
  const failed = [];
  
  // Process first 15 leads
  for (let i = 0; i < Math.min(15, needsEnrichment.length); i++) {
    const lead = needsEnrichment[i];
    console.log(`${i + 1}. Searching ${lead.company}...`);
    
    const results = await searchPeople(lead.company);
    
    if (results.length > 0) {
      console.log(`   ✓ Found ${results.length} contact(s)`);
      results.forEach(contact => {
        console.log(`     - ${contact.name} (${contact.title})`);
        console.log(`       Email: ${contact.email}`);
      });
      
      enriched.push({
        ...lead,
        contacts: results
      });
    } else {
      console.log(`   ✗ No contacts found`);
      failed.push(lead);
    }
    
    console.log('');
    
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  fs.writeFileSync('apollo-enriched-march6-306am.json', JSON.stringify(enriched, null, 2));
  fs.writeFileSync('apollo-failed-march6-306am.json', JSON.stringify(failed, null, 2));
  
  console.log('\n=== ENRICHMENT SUMMARY ===');
  console.log(`Successfully enriched: ${enriched.length}`);
  console.log(`Failed to enrich: ${failed.length}`);
  console.log(`\nResults saved to:`);
  console.log(`- apollo-enriched-march6-306am.json`);
  console.log(`- apollo-failed-march6-306am.json`);
  
  return { enriched, failed };
}

enrichLeads().catch(console.error);
