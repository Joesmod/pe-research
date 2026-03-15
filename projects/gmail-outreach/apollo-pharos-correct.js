const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

(async () => {
  try {
    console.log('Searching Pharos Capital Group via Apollo (correct endpoint)...\n');
    
    const response = await axios.post(
      'https://api.apollo.io/api/v1/people/search',
      {
        q_organization_domains: 'pharosfunds.com',
        person_titles: ['Partner', 'Managing Partner', 'Managing Director', 'Principal', 'VP', 'Vice President'],
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

    const people = response.data?.people || [];
    
    if (people.length === 0) {
      console.log('No contacts found. Trying alternate search...\n');
      
      // Try organization search first
      const orgResponse = await axios.post(
        'https://api.apollo.io/api/v1/organizations/search',
        {
          q_organization_domains: 'pharosfunds.com',
          page: 1,
          per_page: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
          }
        }
      );
      
      console.log('Org search result:', JSON.stringify(orgResponse.data, null, 2));
      return;
    }

    console.log(`Found ${people.length} contacts:\n`);
    
    people.forEach((person, idx) => {
      const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
      console.log(`${idx + 1}. ${name}`);
      console.log(`   Title: ${person.title || 'N/A'}`);
      console.log(`   Email: ${person.email || 'Not revealed'}`);
      console.log(`   LinkedIn: ${person.linkedin_url || 'N/A'}`);
      console.log('');
    });

    // Best contact
    const best = people.find(p => 
      (p.title?.toLowerCase().includes('partner') ||
       p.title?.toLowerCase().includes('managing') ||
       p.title?.toLowerCase().includes('ceo')) &&
      p.email
    ) || people[0];

    if (best) {
      const name = best.name || `${best.first_name || ''} ${best.last_name || ''}`.trim();
      console.log('='.repeat(80));
      console.log('RECOMMENDED:');
      console.log(`Name: ${name}`);
      console.log(`Title: ${best.title || 'N/A'}`);
      console.log(`Email: ${best.email || 'Not available'}`);
      console.log(`LinkedIn: ${best.linkedin_url || 'N/A'}`);
      console.log('='.repeat(80));
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
})();
