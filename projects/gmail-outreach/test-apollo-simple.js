const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    console.log('Testing Apollo API...');
    
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_name: 'Vista Equity Partners',
      page: 1,
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('Success!');
    console.log('People found:', response.data.people?.length || 0);
    
    if (response.data.people && response.data.people.length > 0) {
      console.log('\nFirst contact:');
      const p = response.data.people[0];
      console.log('  Name:', p.name);
      console.log('  Title:', p.title);
      console.log('  Email:', p.email);
      console.log('  Email status:', p.email_status);
    }
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.statusText);
    console.error('Details:', JSON.stringify(error.response?.data, null, 2));
  }
}

testApollo();
