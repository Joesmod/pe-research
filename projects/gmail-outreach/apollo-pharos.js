const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

(async () => {
  try {
    console.log('Searching for Pharos Capital Group contacts...\n');
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_domains: ['pharosfunds.com'],
        person_titles: [
          'Partner',
          'Managing Partner',
          'Managing Director',
          'Principal',
          'Vice President',
          'Director',
          'CEO',
          'COO',
          'CFO',
          'CTO',
          'Head of',
          'VP'
        ],
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
      console.log(`Found ${response.data.people.length} contacts:\n`);
      
      response.data.people.forEach((person, idx) => {
        console.log(`${idx + 1}. ${person.name || 'N/A'}`);
        console.log(`   Title: ${person.title || 'N/A'}`);
        console.log(`   Email: ${person.email || 'Not available'}`);
        console.log(`   LinkedIn: ${person.linkedin_url || 'N/A'}`);
        console.log('');
      });

      // Pick best contact
      const best = response.data.people.find(p => 
        p.email && (
          p.title?.toLowerCase().includes('partner') ||
          p.title?.toLowerCase().includes('managing') ||
          p.title?.toLowerCase().includes('ceo')
        )
      );

      if (best) {
        console.log('RECOMMENDED CONTACT:');
        console.log(`Name: ${best.name}`);
        console.log(`Title: ${best.title}`);
        console.log(`Email: ${best.email}`);
        console.log(`LinkedIn: ${best.linkedin_url || 'N/A'}`);
      }
    } else {
      console.log('No results returned from Apollo API');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
})();
