const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testSearch() {
  try {
    console.log('Testing Apollo API with minimal params...\n');
    
    const searchParams = {
      q_organization_name: 'Carmel Capital Partners',
      person_titles: ['Partner', 'Managing Partner', 'CEO'],
      per_page: 5
    };
    
    console.log('Request:', JSON.stringify(searchParams, null, 2));
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      searchParams,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.status);
    console.error('Details:', JSON.stringify(error.response?.data, null, 2));
  }
}

testSearch();
