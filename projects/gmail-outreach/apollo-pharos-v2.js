const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

(async () => {
  try {
    console.log('Searching for Pharos Capital Group contacts (v2)...\n');
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        organization_domains: ['pharosfunds.com'],
        person_titles: [
          'Partner',
          'Managing Partner',
          'Managing Director',
          'Principal',
          'Vice President',
          'Director'
        ],
        page: 1,
        per_page: 10,
        reveal_personal_emails: true
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
        console.log(`${idx + 1}. ${person.name || person.first_name + ' ' + person.last_name || 'N/A'}`);
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
        console.log('='.repeat(80));
        console.log('RECOMMENDED CONTACT:');
        console.log(`Name: ${best.name || best.first_name + ' ' + best.last_name}`);
        console.log(`Title: ${best.title}`);
        console.log(`Email: ${best.email}`);
        console.log(`LinkedIn: ${best.linkedin_url || 'N/A'}`);
        console.log('='.repeat(80));
      }
    } else {
      console.log('No results. Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    if (error.response) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
})();
