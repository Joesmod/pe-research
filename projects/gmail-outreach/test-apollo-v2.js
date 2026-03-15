const axios = require('axios');

const apiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    console.log('Testing Apollo API v2 endpoint...');
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: 'Vista Equity Partners',
      person_titles: ['Managing Partner', 'Partner', 'CEO'],
      per_page: 3
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Success!');
    console.log('People found:', response.data.people?.length || 0);
    if (response.data.people && response.data.people.length > 0) {
      console.log('\nFirst person full object:');
      console.log(JSON.stringify(response.data.people[0], null, 2));
    }
  } catch (err) {
    console.error('Error details:');
    console.error('Status:', err.response?.status);
    console.error('Status text:', err.response?.statusText);
    console.error('Data:', JSON.stringify(err.response?.data, null, 2));
  }
}

testApollo();
