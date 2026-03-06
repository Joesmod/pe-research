const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPEContacts(firmName, titles = ['Partner', 'Managing Partner', 'Managing Director']) {
  try {
    // Apollo API endpoint for people search
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_name: firmName,
        person_titles: titles,
        page: 1,
        per_page: 5
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
      console.log(`\n✓ Found ${response.data.people.length} contacts for ${firmName}:\n`);
      
      response.data.people.forEach(person => {
        console.log(`Name: ${person.first_name} ${person.last_name}`);
        console.log(`Title: ${person.title}`);
        console.log(`Email: ${person.email || '[NOT AVAILABLE]'}`);
        console.log(`LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log('---');
      });
      
      return response.data.people;
    } else {
      console.log(`No contacts found for ${firmName}`);
      return [];
    }
  } catch (error) {
    console.error(`Error searching Apollo for ${firmName}:`);
    console.error(error.response?.data || error.message);
    return [];
  }
}

// Test with Avista Healthcare Partners
(async () => {
  console.log('Testing Apollo API...\n');
  
  const firms = [
    'Avista Healthcare Partners',
    'BH3 Management',
    'Bloom Equity Partners'
  ];
  
  for (const firm of firms) {
    await searchPEContacts(firm);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
})();
