const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    console.log('Testing Apollo API with simple organization search...\n');
    
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_name: "Bindley Capital",
      page: 1,
      per_page: 5,
      person_titles: ["Partner", "Managing Director", "Principal"]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('✅ Success!');
    console.log(`Found ${response.data.people?.length || 0} people`);
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.statusText);
    console.error('Details:', JSON.stringify(error.response?.data, null, 2));
  }
}

testApollo();
