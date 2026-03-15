const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  { row: 1163, name: 'Trivest Partners', domain: 'trivest.com' },
  { row: 1164, name: 'Blackford Capital', domain: 'blackfordcapital.com' },
  { row: 1165, name: 'CenterOak Partners', domain: 'centeroakpartners.com' },
  { row: 1166, name: 'InterMedia Partners', domain: 'intermediapartners.com' },
  { row: 1167, name: 'Resilience Capital Partners', domain: 'resiliencecapital.com' },
];

async function searchApollo(firmName, domain) {
  try {
    // Try simple organization domain search
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        organization_domains: [domain],
        page: 1,
        per_page: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter for senior titles
      const seniorTitles = ['ceo', 'coo', 'cfo', 'cto', 'founder', 'co-founder',
                           'partner', 'managing', 'president', 'chief', 'vp', 'vice president',
                           'director', 'head of'];
      
      const people = response.data.people
        .filter(p => {
          const titleLower = (p.title || '').toLowerCase();
          return seniorTitles.some(t => titleLower.includes(t)) && p.email && p.email.includes('@');
        })
        .map(p => ({
          name: p.name,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url
        }))
        .slice(0, 3); // Top 3 senior contacts
      
      return people;
    }
    
    return [];
  } catch (error) {
    console.error(`Apollo API error for ${firmName}: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data:`, JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

async function enrichLeads() {
  const results = [];
  
  for (const firm of firms) {
    console.log(`\n🔍 Searching ${firm.name} (${firm.domain})...`);
    
    const contacts = await searchApollo(firm.name, firm.domain);
    
    if (contacts.length > 0) {
      console.log(`   ✅ Found ${contacts.length} contacts:`);
      contacts.forEach(c => {
        console.log(`      - ${c.name} (${c.title})`);
        console.log(`        Email: ${c.email}`);
      });
      
      results.push({
        row: firm.row,
        firm: firm.name,
        domain: firm.domain,
        contacts
      });
    } else {
      console.log(`   ⚠️  No contacts found via Apollo`);
      results.push({
        row: firm.row,
        firm: firm.name,
        domain: firm.domain,
        contacts: []
      });
    }
    
    // Rate limit: 5 requests/second for Apollo
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return results;
}

enrichLeads()
  .then(async results => {
    console.log(`\n\n=== ENRICHMENT RESULTS ===`);
    console.log(`Total firms processed: ${results.length}`);
    const enriched = results.filter(r => r.contacts.length > 0);
    console.log(`Successfully enriched: ${enriched.length}`);
    console.log(`Failed to enrich: ${results.length - enriched.length}`);
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync(
      'enrich-results-march14-507am.json',
      JSON.stringify(results, null, 2)
    );
    console.log(`\n✅ Results saved to enrich-results-march14-507am.json`);
  })
  .catch(console.error);
