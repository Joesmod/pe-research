const axios = require('axios');

const apiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    console.log('Testing Apollo API...');
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_name: 'Apax Partners',
      person_titles: ['Partner'],
      per_page: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Success!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error details:');
    console.error('Status:', err.response?.status);
    console.error('Status text:', err.response?.statusText);
    console.error('Data:', JSON.stringify(err.response?.data, null, 2));
    console.error('Headers:', err.response?.headers);
  }
}

testApollo();
