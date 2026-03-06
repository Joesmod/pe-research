const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPEContacts(firmName, titles = ['Partner', 'Managing Partner', 'Managing Director', 'CEO', 'CFO', 'COO']) {
  try {
    // New Apollo API endpoint
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_name: firmName,
        person_titles: titles,
        page: 1,
        per_page: 10,
        // Request email verification
        email_status: ['verified', 'guessed', 'unavailable']
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
      
      const enriched = [];
      
      response.data.people.forEach(person => {
        const hasEmail = person.email && !person.email.includes('info@') && !person.email.includes('contact@');
        
        console.log(`${person.first_name} ${person.last_name}`);
        console.log(`  Title: ${person.title || 'N/A'}`);
        console.log(`  Email: ${person.email || '[NONE]'} ${person.email_status ? `(${person.email_status})` : ''}`);
        console.log(`  LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log('');
        
        if (hasEmail) {
          enriched.push({
            name: `${person.first_name} ${person.last_name}`,
            title: person.title,
            email: person.email,
            emailStatus: person.email_status,
            linkedin: person.linkedin_url
          });
        }
      });
      
      return enriched;
    } else {
      console.log(`No contacts found for ${firmName}`);
      return [];
    }
  } catch (error) {
    console.error(`Error searching Apollo for ${firmName}:`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return [];
  }
}

// Test with multiple firms
(async () => {
  console.log('Testing Apollo API v2...\n');
  console.log('='.repeat(60));
  
  const firms = [
    'Avista Healthcare Partners',
    'BH3 Management',
    'Bloom Equity Partners'
  ];
  
  for (const firm of firms) {
    console.log(`\nSearching: ${firm}`);
    console.log('-'.repeat(60));
    const results = await searchPEContacts(firm);
    if (results.length > 0) {
      console.log(`✓ ${results.length} verified contacts with emails`);
    }
    await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limiting
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Apollo API test complete.');
})();
