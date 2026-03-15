const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function enrichPerson() {
  console.log('🔍 Enriching person from Apollo...\n');
  
  try {
    // First, search for people at Sverica
    const orgResponse = await axios.get(
      'https://api.apollo.io/api/v1/organizations/enrich',
      {
        params: { domain: 'sverica.com' },
        headers: { 'X-Api-Key': APOLLO_API_KEY }
      }
    );
    
    const orgId = orgResponse.data.organization?.id;
    
    const searchResponse = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        organization_ids: [orgId],
        person_seniorities: ['partner', 'c_suite'],
        per_page: 5,
        page: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    console.log(`Found ${searchResponse.data.people.length} people\n`);
    
    // Try to enrich the first person (Jordan Richards)
    const jordanId = searchResponse.data.people[0].id;
    console.log(`Enriching person ID: ${jordanId}...`);
    
    const enrichResponse = await axios.get(
      'https://api.apollo.io/api/v1/people/match',
      {
        params: {
          id: jordanId
        },
        headers: { 'X-Api-Key': APOLLO_API_KEY }
      }
    );
    
    const person = enrichResponse.data.person;
    console.log('\nEnriched person:');
    console.log('Name:', `${person.first_name} ${person.last_name}`);
    console.log('Title:', person.title);
    console.log('Email:', person.email || 'N/A');
    console.log('LinkedIn:', person.linkedin_url || 'N/A');
    console.log('Organization:', person.organization?.name);
    
    // Save results
    const results = searchResponse.data.people.slice(0, 3).map(p => ({
      id: p.id,
      first_name: p.first_name,
      last_name_hint: p.last_name_obfuscated,
      title: p.title,
      has_email: p.has_email
    }));
    
    console.log('\n📋 Top 3 people found:');
    results.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.first_name} ${p.last_name_hint} - ${p.title} (email: ${p.has_email ? 'available' : 'no'})`);
    });
    
    fs.writeFileSync(
      path.join(__dirname, 'apollo-enrich-results.json'),
      JSON.stringify({ enriched: person, all_people: results }, null, 2)
    );
    console.log('\n💾 Results saved to apollo-enrich-results.json');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

enrichPerson();
