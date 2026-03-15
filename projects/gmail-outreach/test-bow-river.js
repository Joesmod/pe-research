const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testSearch() {
  try {
    console.log('Testing Bow River Capital with domain...\n');
    
    const searchParams = {
      organization_domains: ['bowrivercapital.com'],
      person_titles: ['Partner', 'Managing Partner', 'Managing Director', 'CEO'],
      person_seniorities: ['partner', 'c_suite'],
      per_page: 10
    };
    
    console.log('Request:', JSON.stringify(searchParams, null, 2));
    console.log('');
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      searchParams,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log('Success!');
    console.log(`Found ${response.data.people?.length || 0} people\n`);
    
    // Log raw first person to see structure
    if (response.data.people && response.data.people.length > 0) {
      console.log('RAW FIRST PERSON:');
      console.log(JSON.stringify(response.data.people[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error.response?.status);
    console.error('Details:', JSON.stringify(error.response?.data, null, 2));
  }
}

testSearch();
