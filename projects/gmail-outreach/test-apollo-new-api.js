const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testNewApolloAPI() {
  try {
    console.log('Testing NEW Apollo API endpoint...\n');
    console.log('Endpoint: https://api.apollo.io/api/v1/mixed_people/api_search');
    console.log('Domain: thrivecap.com\n');
    
    // Test the new API endpoint with organization domain
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_domains: 'thrivecap.com',
      person_titles: ['CEO', 'Managing Partner', 'Partner', 'Founder', 'President'],
      page: 1,
      per_page: 10
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'x-api-key': APOLLO_API_KEY
      }
    });
    
    console.log('Response status:', response.status);
    console.log('\nPeople found:', response.data.people?.length || 0);
    
    if (response.data.people && response.data.people.length > 0) {
      console.log('\nFirst result:');
      const person = response.data.people[0];
      console.log('Name:', person.name || `${person.first_name} ${person.last_name}`);
      console.log('Title:', person.title);
      console.log('Email:', person.email || 'NO EMAIL (expected - need enrichment)');
      console.log('LinkedIn:', person.linkedin_url);
      console.log('Person ID:', person.id);
    }
    
    console.log('\nFull response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\nError:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testNewApolloAPI();
