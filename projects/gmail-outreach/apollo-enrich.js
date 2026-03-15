const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const contacts = [
  {
    name: 'Blair Richardson',
    company: 'Bow River Capital',
    title: 'CEO',
    domain: 'bowrivercapital.com'
  },
  {
    name: 'Dave Finley',
    company: 'Sverica Capital Management',
    title: 'Managing Partner',
    domain: 'sverica.com'
  },
  {
    name: 'Bassem Mansour',
    company: 'Resilience Capital Partners',
    title: 'CEO',
    domain: 'resiliencecapital.com'
  },
  {
    name: 'Alex Beregovsky',
    company: 'Marlin Equity Partners',
    title: 'Managing Director',
    domain: 'marlinequity.com'
  },
  {
    name: 'Sean Honey',
    company: 'Main Post Partners',
    title: 'Managing Partner',
    domain: 'mainpostpartners.com'
  },
  {
    name: 'Jim Mahoney',
    company: 'Huron Capital',
    title: 'Managing Partner',
    domain: 'huroncapital.com'
  }
];

async function searchContact(contact) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/people/match',
      {
        first_name: contact.name.split(' ')[0],
        last_name: contact.name.split(' ').slice(1).join(' '),
        organization_name: contact.company,
        domain: contact.domain
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data.person) {
      const person = response.data.person;
      console.log(`\n✓ ${contact.name} (${contact.company}):`);
      console.log(`  Email: ${person.email || 'NOT FOUND'}`);
      console.log(`  Title: ${person.title || 'N/A'}`);
      console.log(`  LinkedIn: ${person.linkedin_url || 'N/A'}`);
      return person;
    } else {
      console.log(`\n✗ ${contact.name} (${contact.company}): Not found in Apollo`);
      return null;
    }
  } catch (error) {
    console.log(`\n✗ ${contact.name} (${contact.company}): Error - ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function enrichAll() {
  console.log('🔍 Searching Apollo for verified contacts...\n');
  
  for (const contact of contacts) {
    await searchContact(contact);
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Apollo enrichment complete');
}

enrichAll();
