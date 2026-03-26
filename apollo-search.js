const axios = require('axios');
const apiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApollo(organization) {
  const response = await axios.post('https://api.apollo.io/v1/mixed_people/api_search', {
    q_organization_name: organization,
    page: 1,
    per_page: 10,
    person_titles: ['Partner', 'Managing Partner', 'Director', 'VP', 'Principal', 'CEO', 'CFO', 'COO']
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apiKey
    }
  });
  return response.data;
}

async function main() {
  try {
    const firms = [
      'Rockwood Equity Partners',
      'Waud Capital Partners',
      'Clearview Capital',
      'Banner Capital Management',
      'Lux Capital',
      'Energy Impact Partners',
      'Quake Capital Partners'
    ];
    
    for (const firm of firms) {
      console.log(`\n=== ${firm} ===`);
      try {
        const result = await searchApollo(firm);
        
        if (result.people && result.people.length > 0) {
          result.people.forEach(p => {
            console.log(`Name: ${p.name}`);
            console.log(`Title: ${p.title}`);
            console.log(`Email: ${p.email || 'Not available'}`);
            console.log(`LinkedIn: ${p.linkedin_url || 'N/A'}`);
            console.log('---');
          });
        } else {
          console.log('No results found');
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Error for ${firm}:`, err.response?.data || err.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

main();
