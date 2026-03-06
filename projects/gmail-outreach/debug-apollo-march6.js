const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function searchApollo(companyName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: companyName,
      page: 1,
      per_page: 3
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };

    console.log('Searching for:', companyName);

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          console.log('\nFull Response:');
          console.log(JSON.stringify(parsed, null, 2));
          resolve(parsed);
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

searchApollo("Thrive Capital").catch(console.error);
