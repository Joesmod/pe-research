const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Test with the correct endpoint from error message
async function testAPISearch() {
  console.log('\n=== Testing /v1/mixed_people/api_search ===\n');
  
  const payload = JSON.stringify({
    q_organization_name: "Arsenal Capital",
    person_titles: ["Partner", "Managing Director", "CEO"],
    page: 1,
    per_page: 3
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/api_search',  // Correct path based on error message
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        console.log('\nResponse body:');
        console.log(data);
        
        try {
          const result = JSON.parse(data);
          console.log('\nParsed:');
          console.log('People found:', result.people?.length || 0);
          if (result.error) {
            console.log('Error:', result.error);
          }
          resolve(result);
        } catch (e) {
          console.log('Parse error:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.log('Request error:', e.message);
      reject(e);
    });
    req.write(payload);
    req.end();
  });
}

testAPISearch();
