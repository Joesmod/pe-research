const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    // Find Thrive Capital
    const orgResponse = await axios.post('https://api.apollo.io/v1/organizations/search', {
      q_organization_domains: 'thrivecap.com',
      page: 1,
      per_page: 1
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    const org = orgResponse.data.organizations[0];
    console.log('Organization ID:', org.id);
    console.log('Organization Name:', org.name, '\n');
    
    // Search for people using the new endpoint
    console.log('Testing new people search endpoint...\n');
    
    const peopleResponse = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      organization_ids: [org.id],
      person_titles: ['CEO', 'Managing Partner', 'Partner', 'Founder'],
      page: 1,
      per_page: 3
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('Full API response:');
    console.log(JSON.stringify(peopleResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

testApollo();
