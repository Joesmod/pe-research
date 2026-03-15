const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function debugApollo() {
  console.log('🔍 Debugging Apollo API response...\n');
  
  try {
    const orgResponse = await axios.get(
      'https://api.apollo.io/api/v1/organizations/enrich',
      {
        params: {
          domain: 'sverica.com'
        },
        headers: {
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    const orgId = orgResponse.data.organization?.id;
    console.log('Organization ID:', orgId);
    
    if (orgId) {
      const peopleResponse = await axios.post(
        'https://api.apollo.io/api/v1/mixed_people/api_search',
        {
          organization_ids: [orgId],
          person_seniorities: ['partner', 'c_suite', 'vp'],
          per_page: 10,
          page: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
        }
      );
      
      console.log('Full response keys:', Object.keys(peopleResponse.data));
      console.log('People count:', peopleResponse.data.people?.length);
      
      if (peopleResponse.data.people && peopleResponse.data.people.length > 0) {
        const firstPerson = peopleResponse.data.people[0];
        console.log('\nFirst person full object:');
        console.log(JSON.stringify(firstPerson, null, 2));
        
        // Save full response for inspection
        fs.writeFileSync(
          path.join(__dirname, 'apollo-debug-full-response.json'),
          JSON.stringify(peopleResponse.data, null, 2)
        );
        console.log('\n💾 Full response saved to apollo-debug-full-response.json');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Data:', error.response.data);
    }
  }
}

debugApollo();
