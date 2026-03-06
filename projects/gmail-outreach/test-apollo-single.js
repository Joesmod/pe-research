const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testSearch() {
  try {
    console.log('Testing Apollo API...');
    
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/api_search', {
      organization_names: ['Apax Partners'],
      person_titles: ['Partner', 'Managing Director', 'CEO', 'Managing Partner'],
      per_page: 10,
      page: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('Success!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error details:');
    console.error('Status:', err.response?.status);
    console.error('Data:', JSON.stringify(err.response?.data, null, 2));
    console.error('Message:', err.message);
  }
}

testSearch();
