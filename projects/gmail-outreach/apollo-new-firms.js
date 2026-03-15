const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const firms = [
  {
    name: 'Berkshire Partners',
    domain: 'berkshirepartners.com',
    location: 'Boston'
  },
  {
    name: 'LLR Partners',
    domain: 'llrpartners.com',
    location: 'Philadelphia'
  },
  {
    name: 'Thomas H. Lee Partners',
    domain: 'thl.com',
    location: 'Boston'
  }
];

async function searchFirmContacts(firm) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        organization_domains: [firm.domain],
        person_titles: ['Managing Partner', 'Managing Director', 'Partner', 'CEO', 'President'],
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

    if (response.data.people && response.data.people.length > 0) {
      console.log(`\n✓ ${firm.name}:`);
      response.data.people.forEach((person, idx) => {
        if (idx < 2) { // Show top 2
          console.log(`  ${idx + 1}. ${person.name}`);
          console.log(`     Title: ${person.title || 'N/A'}`);
          console.log(`     Email: ${person.email || 'NOT FOUND'}`);
          console.log(`     LinkedIn: ${person.linkedin_url || 'N/A'}`);
        }
      });
      return response.data.people.slice(0, 2);
    } else {
      console.log(`\n✗ ${firm.name}: No contacts found`);
      return [];
    }
  } catch (error) {
    console.log(`\n✗ ${firm.name}: Error - ${error.response?.data?.error || error.message}`);
    return [];
  }
}

async function searchAll() {
  console.log('🔍 Searching Apollo for new firm contacts...\n');
  
  const allContacts = [];
  for (const firm of firms) {
    const contacts = await searchFirmContacts(firm);
    allContacts.push({ firm, contacts });
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n✅ Apollo search complete');
  return allContacts;
}

searchAll();
