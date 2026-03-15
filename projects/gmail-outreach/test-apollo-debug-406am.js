const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  console.log('Testing Apollo API with debug...\n');
  
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_domains: 'mercuryfund.com',
      person_titles: [
        'CEO', 'Managing Partner', 'Partner', 'President'
      ],
      page: 1,
      per_page: 3
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('Response status:', response.status);
    console.log('People count:', response.data.people?.length || 0);
    console.log('\nFirst person object:');
    console.log(JSON.stringify(response.data.people[0], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testApollo();
