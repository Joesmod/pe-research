const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeople(companyName, titles = []) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_name: companyName,
        person_titles: titles,
        page: 1,
        per_page: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people) {
      return response.data.people.map(person => ({
        name: person.name,
        title: person.title,
        email: person.email,
        linkedin: person.linkedin_url,
        emailStatus: person.email_status,
        companyName: person.organization?.name
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error searching ${companyName}:`, error.response?.data || error.message);
    return [];
  }
}

async function main() {
  const firms = [
    { name: 'Consonance Capital Partners', titles: ['Managing Partner', 'Partner', 'Co-Founder'] },
    { name: 'Edgewater Capital Partners', titles: ['Managing Partner', 'Partner'] },
    { name: 'Gladstone Investment Corporation', titles: ['CEO', 'President', 'Managing Director'] },
    { name: 'NewView Capital', titles: ['Managing Partner', 'Founder', 'Partner'] },
    { name: 'Nexa Equity', titles: ['Managing Partner', 'Founder', 'Partner'] },
    { name: 'Pearl Energy Investments', titles: ['Managing Partner', 'Founder', 'Partner'] },
    { name: 'Physician Growth Partners', titles: ['CEO', 'Managing Partner', 'Partner'] },
    { name: 'Reach Capital', titles: ['General Partner', 'Co-Founder', 'Partner'] },
    { name: 'Periculum Capital', titles: ['Managing Director', 'Co-Founder', 'Senior Managing Director'] },
    { name: 'North Atlantic Capital', titles: ['Managing Director', 'Co-Founder', 'Partner'] }
  ];

  for (const firm of firms) {
    console.log(`\n=== ${firm.name} ===`);
    const results = await searchPeople(firm.name, firm.titles);
    
    if (results.length > 0) {
      results.forEach(person => {
        console.log(`${person.name} | ${person.title} | ${person.email || 'NO EMAIL'} | ${person.emailStatus || 'N/A'} | ${person.linkedin || ''}`);
      });
    } else {
      console.log('No results found');
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);
