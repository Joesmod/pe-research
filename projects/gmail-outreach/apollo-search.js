const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeople(orgName, titles = ['Managing Partner', 'CEO', 'Managing Director']) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      organization_name: orgName,
      person_titles: titles,
      page: 1,
      per_page: 5
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

async function main() {
  const orgName = process.argv[2] || 'Peak Rock Capital';
  console.log(`Searching Apollo for: ${orgName}`);
  
  try {
    const results = await searchPeople(orgName);
    
    console.log('API Response:', JSON.stringify(results, null, 2));
    
    if (results.people && results.people.length > 0) {
      console.log(`\nFound ${results.people.length} contacts:\n`);
      results.people.forEach(p => {
        console.log(`Name: ${p.first_name} ${p.last_name}`);
        console.log(`Title: ${p.title}`);
        console.log(`Email: ${p.email || '(not available)'}`);
        console.log(`LinkedIn: ${p.linkedin_url || '(not available)'}`);
        console.log('---');
      });
    } else {
      console.log('No contacts found or error');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
