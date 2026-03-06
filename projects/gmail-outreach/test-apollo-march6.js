const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function testApollo() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_key: APOLLO_API_KEY,
      q_organization_name: "Thrive Capital",
      page: 1,
      per_page: 3
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Cache-Control': 'no-cache'
      }
    };

    console.log('Testing Apollo API...');
    console.log('Request:', data);

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('\nStatus Code:', res.statusCode);
        console.log('Response:', body);
        try {
          const parsed = JSON.parse(body);
          console.log('\nParsed:', JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (e) {
          console.error('Parse error:', e);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

testApollo().catch(console.error);
