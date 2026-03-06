const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    // Test 1: Simple organization search
    console.log('Testing simple organization search...');
    const orgResponse = await axios.post('https://api.apollo.io/v1/organizations/search', {
      q_organization_name: 'Ribbit Capital',
      page: 1,
      per_page: 1
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('Organization search result:');
    console.log(JSON.stringify(orgResponse.data, null, 2));
    
    // Test 2: People search with organization domain
    console.log('\n\nTesting people search...');
    const peopleResponse = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_domains: ['ribbit.com'],
      page: 1,
      per_page: 5
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('People search result:');
    console.log(JSON.stringify(peopleResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

testApollo();
