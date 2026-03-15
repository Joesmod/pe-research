// Simple Apollo API test
const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchApollo(domain) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      api_key: API_KEY,
      q_organization_domains: domain,
      page: 1,
      per_page: 5
    });

    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log('Response:', JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (e) {
          console.error('Parse error:', e.message);
          console.error('Raw data:', data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

(async () => {
  console.log('\n=== Testing Apollo API ===\n');
  console.log('Searching bowrivercapital.com...\n');
  
  try {
    await searchApollo('bowrivercapital.com');
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
