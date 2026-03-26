const fetch = require('node-fetch');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPerson(name, organization) {
  const url = 'https://api.apollo.io/api/v1/people/match?reveal_personal_emails=true';
  
  const payload = {
    first_name: name.split(' ')[0],
    last_name: name.split(' ').slice(1).join(' '),
    organization_name: organization
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Error searching for ${name}:`, data);
      return null;
    }

    if (data.person) {
      const person = data.person;
      return {
        name: person.name,
        title: person.title,
        email: person.email,
        emailStatus: person.email_status,
        organization: person.organization?.name,
        linkedin: person.linkedin_url,
        found: true
      };
    }
    
    return { found: false };
  } catch (error) {
    console.error(`Error searching for ${name}:`, error.message);
    return null;
  }
}

async function main() {
  const targets = [
    { name: 'Jack McCarthy', org: 'Alvarez & Marsal Capital' },
    { name: 'Dan Wechsler', org: 'Blue Star Innovation Partners' },
    { name: 'Dan Agroskin', org: 'JLL Partners' }
  ];

  console.log('=== APOLLO ENRICHMENT ===\n');

  for (const target of targets) {
    console.log(`Searching: ${target.name} at ${target.org}...`);
    const result = await searchPerson(target.name, target.org);
    
    if (result && result.found) {
      console.log(`  ✓ Found: ${result.name}`);
      console.log(`  Title: ${result.title || 'N/A'}`);
      console.log(`  Email: ${result.email || 'N/A'} (${result.emailStatus || 'unknown'})`);
      console.log(`  LinkedIn: ${result.linkedin || 'N/A'}`);
    } else {
      console.log(`  ✗ Not found in Apollo`);
    }
    console.log('');
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);
