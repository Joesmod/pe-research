const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  try {
    console.log('Testing Apollo API with simple search...');
    
    const payload = {
      q_organization_name: 'Trivest Partners',
      person_titles: ['CEO', 'Managing Partner'],
      per_page: 3
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('Success!');
    console.log('People found:', response.data.people?.length || 0);
    
    if (response.data.people && response.data.people.length > 0) {
      console.log('\nFirst result:');
      const person = response.data.people[0];
      console.log('Name:', person.name);
      console.log('Title:', person.title);
      console.log('Email:', person.email);
      console.log('ID:', person.id);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.statusText);
    console.error('Message:', error.response?.data?.message || error.response?.data);
    console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testApollo();
