const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    console.log('Testing Apollo API with Audax Private Equity...\n');
    
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: 'Audax Private Equity',
      person_titles: ['CEO', 'Partner', 'Managing Director'],
      page: 1,
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('Status:', response.status);
    console.log('People found:', response.data.people?.length || 0);
    console.log('\nFull response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.statusText);
    console.error('Details:', JSON.stringify(error.response?.data, null, 2));
  }
}

testApollo();
