const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  { name: 'Argand Partners', domain: 'argandequity.com' },
  { name: 'Banner Capital', domain: 'bannercap.com' },
  { name: 'Capitala Group', domain: 'capitalagroup.com' },
  { name: 'Capstreet', domain: 'capstreet.com' },
  { name: 'GenNx360 Capital Partners', domain: 'gennx360.com' }
];

async function searchPeopleByDomain(firmName, domain) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      organization_domains: [domain],
      person_titles: [
        'Managing Partner',
        'Managing Director',
        'Partner',
        'Founder',
        'CEO',
        'President',
        'COO',
        'CFO'
      ],
      page: 1,
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people) {
      console.log(`\n=== ${firmName} (${domain}) ===`);
      
      if (response.data.people.length === 0) {
        console.log('  No contacts found in Apollo');
        return null;
      }
      
      // Get the top contact
      const contact = response.data.people[0];
      console.log(`  Name: ${contact.first_name} ${contact.last_name}`);
      console.log(`  Title: ${contact.title || '(not available)'}`);
      console.log(`  Email: ${contact.email || '(not available)'}`);
      console.log(`  LinkedIn: ${contact.linkedin_url || '(not available)'}`);
      
      return {
        firmName,
        domain,
        contactName: `${contact.first_name} ${contact.last_name}`,
        title: contact.title || '',
        email: contact.email || '',
        linkedin: contact.linkedin_url || '',
        source: 'Apollo API'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching ${firmName}:`, error.response?.data || error.message);
    return null;
  }
}

async function enrichAll() {
  const results = [];
  
  for (const firm of firms) {
    const result = await searchPeopleByDomain(firm.name, firm.domain);
    if (result) {
      results.push(result);
    }
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n=== SUMMARY ===');
  console.log(`Successfully enriched: ${results.length}/${firms.length} firms`);
  
  const fs = require('fs');
  fs.writeFileSync('apollo-enrichment-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to apollo-enrichment-results.json');
  
  return results;
}

enrichAll().catch(console.error);
