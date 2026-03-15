const https = require('https');

const apolloApiKey = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPerson(firstName, lastName, orgName) {
  const data = JSON.stringify({
    first_name: firstName,
    last_name: lastName,
    organization_name: orgName,
    page: 1,
    per_page: 5
  });

  const options = {
    hostname: 'api.apollo.io',
    port: 443,
    path: '/api/v1/mixed_people/api_search',
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
const firstName = process.argv[2];
const lastName = process.argv[3];
const orgName = process.argv[4];

searchPerson(firstName, lastName, orgName)
  .then(result => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
