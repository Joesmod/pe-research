const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchContacts(domain, firmName) {
  try {
    console.log(`\n🔍 Searching ${firmName} (${domain})...`);
    
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: domain,
      page: 1,
      per_page: 10
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    const people = response.data.people || [];
    
    console.log(`Found ${people.length} people`);
    
    for (const person of people) {
      console.log(`\n${person.name}`);
      console.log(`  Title: ${person.title}`);
      console.log(`  Email: ${person.email || 'Not available'}`);
      console.log(`  LinkedIn: ${person.linkedin_url || 'N/A'}`);
    }
    
    return people;
    
  } catch (error) {
    console.error(`❌ Error:`, error.response?.data || error.message);
    return [];
  }
}

const domain = process.argv[2] || 'aerispartners.com';
const firmName = process.argv[3] || 'Aeris Partners';

searchContacts(domain, firmName);
