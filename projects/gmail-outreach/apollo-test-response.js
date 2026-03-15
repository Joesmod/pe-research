const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Test Apollo API to see actual response structure
function searchApollo(companyName, titles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q_organization_name: companyName,
      person_titles: titles,
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

// Test with one company
async function test() {
  const titles = ['CEO', 'Managing Partner', 'Partner', 'Director'];
  
  console.log('Testing Apollo API with Mercury Fund...\n');
  
  try {
    const response = await searchApollo('Mercury Fund', titles);
    console.log('Full response structure:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
