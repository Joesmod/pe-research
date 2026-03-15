const https = require('https');

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchOrg(orgName) {
  const data = JSON.stringify({
    organization_name: orgName,
    person_titles: ["Managing Partner", "Partner", "Managing Director", "Co-Founder", "Founder", "CEO"],
    page: 1,
    per_page: 10
  });

  const options = {
    hostname: 'api.apollo.io',
    port: 443,
    path: '/api/v1/mixed_people/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apolloApiKey,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
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

// Usage
const orgName = process.argv[2];

searchOrg(orgName)
  .then(result => {
    console.log(`\nFound ${result.people ? result.people.length : 0} people at ${orgName}:\n`);
    if (result.people) {
      result.people.forEach(person => {
        console.log(`${person.first_name} ${person.last_name || person.last_name_obfuscated}`);
        console.log(`  Title: ${person.title}`);
        console.log(`  Has Email: ${person.has_email ? 'Yes' : 'No'}`);
        console.log(`  Email: ${person.email || 'N/A (requires credit)'}`);
        console.log('');
      });
    }
    console.log('\nFull response:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
