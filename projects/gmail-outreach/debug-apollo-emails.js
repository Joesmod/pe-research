const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    console.log('Testing Apollo API with Thrive Capital...\n');
    
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: 'Thrive Capital',
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    console.log('Response structure:');
    console.log('Total people:', response.data.people.length);
    console.log('\nFirst 3 people:');
    
    response.data.people.slice(0, 3).forEach((person, i) => {
      console.log(`\nPerson ${i+1}:`);
      console.log('  Name:', person.name);
      console.log('  Title:', person.title);
      console.log('  Email:', person.email);
      console.log('  Email status:', person.email_status);
      console.log('  LinkedIn:', person.linkedin_url);
      console.log('  ID:', person.id);
      console.log('  Organization:', person.organization?.name);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testApollo();
