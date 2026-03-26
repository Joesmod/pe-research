const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchByDomain(domain) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_domains: domain,
      person_titles: ['CEO', 'Managing Partner', 'Managing Director', 'Partner', 'President'],
      page: 1,
      per_page: 10
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function enrichPerson(personId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: personId,
      reveal_personal_emails: true
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/people/match',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const domain = process.argv[2] || 'peakrockcapital.com';
  console.log(`Searching Apollo for domain: ${domain}\n`);
  
  try {
    const results = await searchByDomain(domain);
    
    if (results.people && results.people.length > 0) {
      console.log(`Found ${results.people.length} potential contacts\n`);
      
      // Try to enrich the first contact
      const firstPerson = results.people[0];
      console.log(`Enriching: ${firstPerson.first_name} ${firstPerson.last_name_obfuscated || ''}`);
      console.log(`Title: ${firstPerson.title}`);
      console.log(`Org: ${firstPerson.organization?.name || 'N/A'}\n`);
      
      const enriched = await enrichPerson(firstPerson.id);
      
      if (enriched.person) {
        const p = enriched.person;
        console.log('✅ Enriched Contact:');
        console.log(`Name: ${p.first_name} ${p.last_name}`);
        console.log(`Title: ${p.title}`);
        console.log(`Email: ${p.email || '(not found)'}`);
        console.log(`LinkedIn: ${p.linkedin_url || '(not found)'}`);
        console.log(`Organization: ${p.organization?.name || 'N/A'}`);
      } else {
        console.log('❌ Could not enrich contact');
        console.log('Response:', JSON.stringify(enriched, null, 2));
      }
    } else {
      console.log('No contacts found for this domain');
      console.log('Response:', JSON.stringify(results, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
