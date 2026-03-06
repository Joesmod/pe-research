const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeople(firmName, titles = ['Partner', 'Managing Partner', 'Managing Director', 'CEO', 'CFO', 'COO', 'CTO']) {
  try {
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: firmName,
      person_titles: titles,
      per_page: 5
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data && response.data.people) {
      // Log first person to see structure
      if (response.data.people.length > 0) {
        console.log('Sample person object:', JSON.stringify(response.data.people[0], null, 2));
      }
      
      return response.data.people.map(person => ({
        name: person.first_name + ' ' + person.last_name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        organization: person.organization?.name || person.organization_name
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error searching ${firmName}:`, error.response?.data || error.message);
    return [];
  }
}

// Test with Gridiron Capital
(async () => {
  console.log('Searching Gridiron Capital...\n');
  const results = await searchPeople('Gridiron Capital');
  
  if (results.length > 0) {
    results.forEach((person, idx) => {
      console.log(`${idx + 1}. ${person.name}`);
      console.log(`   Title: ${person.title}`);
      console.log(`   Email: ${person.email || 'Not available'}`);
      console.log(`   LinkedIn: ${person.linkedin || 'Not available'}\n`);
    });
  } else {
    console.log('No results found.');
  }
})();
