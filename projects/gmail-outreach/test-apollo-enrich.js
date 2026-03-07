const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testEnrichment() {
  try {
    // First, search for people
    console.log('Step 1: Searching for people at Thrive Capital...\n');
    
    const searchResponse = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: 'Thrive Capital',
      per_page: 3
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    const people = searchResponse.data.people;
    console.log(`Found ${people.length} people`);
    console.log('Person IDs:', people.map(p => p.id));
    
    // Now try to enrich the first person
    const firstPersonId = people[0].id;
    console.log(`\nStep 2: Enriching person ${firstPersonId}...\n`);
    
    try {
      const enrichResponse = await axios.get(`https://api.apollo.io/api/v1/people/${firstPersonId}`, {
        headers: {
          'X-Api-Key': APOLLO_API_KEY
        }
      });
      
      console.log('Enrichment successful!');
      console.log('Name:', enrichResponse.data.person.name);
      console.log('Title:', enrichResponse.data.person.title);
      console.log('Email:', enrichResponse.data.person.email);
      console.log('LinkedIn:', enrichResponse.data.person.linkedin_url);
      
    } catch (enrichError) {
      console.log('Enrichment endpoint failed:', enrichError.message);
      if (enrichError.response) {
        console.log('Status:', enrichError.response.status);
        console.log('Response:', JSON.stringify(enrichError.response.data, null, 2));
      }
    }
    
    // Try alternative: people/match endpoint
    console.log('\nStep 3: Trying people/match endpoint...\n');
    
    try {
      const matchResponse = await axios.post('https://api.apollo.io/api/v1/people/match', {
        reveal_personal_emails: true,
        reveal_phone_number: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      });
      
      console.log('Match successful!');
      console.log(JSON.stringify(matchResponse.data, null, 2));
      
    } catch (matchError) {
      console.log('Match endpoint failed:', matchError.message);
      if (matchError.response) {
        console.log('Status:', matchError.response.status);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEnrichment();
