const axios = require('axios');

const apiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function testEnrich() {
  try {
    // First search for someone
    console.log('Step 1: Searching for contacts...');
    const searchResponse = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_domains: 'vistaequitypartners.com',
      person_titles: ['Partner', 'Managing Director'],
      per_page: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });
    
    if (!searchResponse.data.people || searchResponse.data.people.length === 0) {
      console.log('No people found');
      return;
    }
    
    const person = searchResponse.data.people[0];
    console.log(`Found: ${person.first_name} ${person.last_name_obfuscated || ''}`);
    console.log(`ID: ${person.id}`);
    console.log(`Has email: ${person.has_email}`);
    
    // Now enrich to get full details
    console.log('\nStep 2: Enriching contact (trying /v1/people/match)...');
    const enrichResponse = await axios.post('https://api.apollo.io/v1/people/match', {
      id: person.id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      }
    });
    
    console.log('\nEnriched data:');
    console.log('Name:', enrichResponse.data.person?.name);
    console.log('Email:', enrichResponse.data.person?.email);
    console.log('Title:', enrichResponse.data.person?.title);
    console.log('LinkedIn:', enrichResponse.data.person?.linkedin_url);
    
  } catch (err) {
    console.error('Error:');
    console.error('Status:', err.response?.status);
    console.error('Message:', err.response?.data?.message || err.message);
    console.error('Data:', JSON.stringify(err.response?.data, null, 2));
  }
}

testEnrich();
