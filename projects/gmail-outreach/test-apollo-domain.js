const axios = require('axios');

const apiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testByDomain() {
  try {
    console.log('Testing Apollo API with domain search...');
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_domains: 'vistaequitypartners.com',
      person_titles: ['Partner', 'Managing Director', 'CEO'],
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Success!');
    console.log('Total entries:', response.data.total_entries);
    console.log('People found:', response.data.people?.length || 0);
    
    if (response.data.people && response.data.people.length > 0) {
      console.log('\nFirst result:');
      console.log(JSON.stringify(response.data.people[0], null, 2));
    }
  } catch (err) {
    console.error('Error:');
    console.error('Status:', err.response?.status);
    console.error('Data:', JSON.stringify(err.response?.data, null, 2));
  }
}

testByDomain();
