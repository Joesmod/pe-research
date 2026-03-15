const axios = require('axios');
const fs = require('fs');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const contacts = [
  { name: 'Herbert Hooper', title: 'Managing Partner', company: 'Ampersand Capital Partners' },
  { name: 'Lawrence Aldrich', title: 'President', company: 'Aldrich Capital Partners' },
  { name: 'Joe Lonsdale', title: 'Founder', company: '8VC' },
  { name: 'Kim Marvin', title: 'Managing Partner', company: 'American Industrial Partners' },
  { name: 'Joshua Schultz', title: 'Operating Partner', company: 'Arsenal Capital Partners' }
];

async function searchPerson(contact) {
  console.log(`\n=== Searching for ${contact.name} at ${contact.company} ===`);
  
  try {
    const [firstName, ...lastNameParts] = contact.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      api_key: API_KEY,
      page: 1,
      per_page: 5,
      person_titles: [contact.title],
      q_organization_name: contact.company,
      person_names: [contact.name]
    });

    if (response.data && response.data.people && response.data.people.length > 0) {
      const person = response.data.people[0];
      console.log('✓ FOUND:');
      console.log(`  Name: ${person.name}`);
      console.log(`  Title: ${person.title}`);
      console.log(`  Company: ${person.organization?.name}`);
      console.log(`  Email: ${person.email || '[NO EMAIL]'}`);
      console.log(`  Email Status: ${person.email_status}`);
      console.log(`  LinkedIn: ${person.linkedin_url || '[NO LINKEDIN]'}`);
      
      return {
        ...contact,
        foundEmail: person.email,
        emailStatus: person.email_status,
        apolloTitle: person.title,
        linkedIn: person.linkedin_url,
        apolloCompany: person.organization?.name
      };
    } else {
      console.log('✗ NOT FOUND in Apollo');
      return { ...contact, foundEmail: null };
    }
  } catch (error) {
    console.log(`✗ ERROR: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    return { ...contact, foundEmail: null, error: error.message };
  }
}

async function searchAll() {
  const results = [];
  
  for (const contact of contacts) {
    const result = await searchPerson(contact);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
  }

  console.log('\n\n=== SUMMARY ===');
  let foundCount = 0;
  results.forEach(r => {
    console.log(`\n${r.name} (${r.company}):`);
    if (r.foundEmail) {
      console.log(`  ✓ Email: ${r.foundEmail}`);
      console.log(`    Status: ${r.emailStatus}`);
      foundCount++;
    } else {
      console.log(`  ✗ No email found`);
    }
  });

  console.log(`\n\nTotal found: ${foundCount}/5`);

  fs.writeFileSync('apollo-people-search-606am.json', JSON.stringify(results, null, 2));
  console.log('Saved results to apollo-people-search-606am.json');
}

searchAll().catch(console.error);
