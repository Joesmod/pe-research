const axios = require('axios');
const fs = require('fs');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const contacts = [
  { name: 'Herbert Hooper', title: 'Managing Partner', company: 'Ampersand Capital Partners', domain: 'ampersandcapital.com' },
  { name: 'Lawrence Aldrich', title: 'President', company: 'Aldrich Capital Partners', domain: 'aldrichcap.com' },
  { name: 'Joe Lonsdale', title: 'Founder Managing Partner', company: '8VC', domain: '8vc.com' },
  { name: 'Kim Marvin', title: 'Managing Partner', company: 'American Industrial Partners', domain: 'americanindustrial.com' },
  { name: 'Joshua Schultz', title: 'Operating Partner', company: 'Arsenal Capital Partners', domain: 'arsenalcapital.com' }
];

async function searchContact(contact) {
  console.log(`\n=== Searching for ${contact.name} at ${contact.company} ===`);
  
  try {
    const response = await axios.post('https://api.apollo.io/v1/people/match', {
      api_key: API_KEY,
      first_name: contact.name.split(' ')[0],
      last_name: contact.name.split(' ').slice(1).join(' '),
      organization_name: contact.company,
      domain: contact.domain
    });

    if (response.data && response.data.person) {
      const person = response.data.person;
      console.log('✓ FOUND:');
      console.log(`  Name: ${person.name}`);
      console.log(`  Title: ${person.title}`);
      console.log(`  Email: ${person.email || '[NO EMAIL]'}`);
      console.log(`  Email Status: ${person.email_status}`);
      console.log(`  LinkedIn: ${person.linkedin_url || '[NO LINKEDIN]'}`);
      
      return {
        ...contact,
        foundEmail: person.email,
        emailStatus: person.email_status,
        apolloTitle: person.title,
        linkedIn: person.linkedin_url
      };
    } else {
      console.log('✗ NOT FOUND in Apollo');
      return { ...contact, foundEmail: null };
    }
  } catch (error) {
    console.log(`✗ ERROR: ${error.response?.data?.message || error.message}`);
    return { ...contact, foundEmail: null, error: error.message };
  }
}

async function searchAll() {
  const results = [];
  
  for (const contact of contacts) {
    const result = await searchContact(contact);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  }

  console.log('\n\n=== SUMMARY ===');
  results.forEach(r => {
    console.log(`\n${r.name} (${r.company}):`);
    console.log(`  Found: ${r.foundEmail || 'NO'}`);
    if (r.foundEmail) {
      console.log(`  Status: ${r.emailStatus}`);
    }
  });

  fs.writeFileSync('apollo-5-contacts-606am.json', JSON.stringify(results, null, 2));
  console.log('\n\nSaved results to apollo-5-contacts-606am.json');
}

searchAll().catch(console.error);
