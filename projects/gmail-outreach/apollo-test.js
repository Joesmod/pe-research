const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Test simple organization search first
async function testOrganizationSearch() {
  try {
    console.log('Testing organization search...');
    
    const response = await axios.get(
      'https://api.apollo.io/v1/organizations/search',
      {
        params: {
          q_organization_domains: 'sfwcap.com',
          page: 1,
          per_page: 1
        },
        headers: {
          'X-Api-Key': APOLLO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Success!', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Test people search with correct endpoint
async function testPeopleSearch() {
  try {
    console.log('\nTesting people search...');
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: 'sfwcap.com',
        person_titles: ['Managing Partner', 'Partner', 'CEO'],
        page: 1,
        per_page: 5
      },
      {
        headers: {
          'X-Api-Key': APOLLO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Success! Found', response.data.pagination?.total_entries, 'people');
    if (response.data.people) {
      response.data.people.forEach(p => {
        console.log(`  - ${p.name} | ${p.title} | ${p.email || 'no email'} | ${p.linkedin_url || 'no LinkedIn'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

async function run() {
  await testOrganizationSearch();
  await testPeopleSearch();
}

run();
