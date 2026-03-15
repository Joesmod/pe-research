const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testApollo() {
  console.log('🔍 Testing Apollo API with simple query...\n');
  
  try {
    // Try organization enrichment first
    console.log('1. Testing organization enrichment for Sverica...');
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
    
    console.log('Organization found:');
    console.log('Name:', orgResponse.data.organization?.name);
    console.log('Domain:', orgResponse.data.organization?.primary_domain);
    console.log('ID:', orgResponse.data.organization?.id);
    
    if (orgResponse.data.organization?.id) {
      // Now try to find people at this organization
      console.log('\n2. Searching for people at this organization...');
      const peopleResponse = await axios.post(
        'https://api.apollo.io/api/v1/mixed_people/api_search',
        {
          organization_ids: [orgResponse.data.organization.id],
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
      
      console.log(`Found ${peopleResponse.data.people?.length || 0} people`);
      
      if (peopleResponse.data.people && peopleResponse.data.people.length > 0) {
        peopleResponse.data.people.slice(0, 3).forEach((person, idx) => {
          console.log(`\n${idx + 1}. ${person.first_name} ${person.last_name}`);
          console.log(`   Title: ${person.title || 'N/A'}`);
          console.log(`   Email: ${person.email || 'N/A'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testApollo();
