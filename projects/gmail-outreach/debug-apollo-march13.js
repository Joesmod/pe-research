// Debug Apollo API to see what data we're getting
const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function searchPeopleApollo(companyName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      q_organization_name: companyName,
      person_titles: ['CEO', 'Partner', 'Managing Partner', 'Director'],
      page: 1,
      per_page: 5
    });
    
    const options = {
      hostname: 'api.apollo.io',
      port: 443,
      path: '/v1/mixed_people/api_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  const testFirms = [
    'ShoreView Industries',
    'The Riverside Company',
    'Genstar Capital'
  ];
  
  for (const firm of testFirms) {
    console.log(`\n=== ${firm} ===`);
    try {
      const result = await searchPeopleApollo(firm);
      console.log('RAW RESPONSE:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('Error:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main();
