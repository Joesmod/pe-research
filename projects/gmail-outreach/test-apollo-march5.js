const https = require('https');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

// Test 1: Organization search
async function testOrgSearch() {
  console.log('\n=== Test 1: Organization Search ===');
  
  const payload = JSON.stringify({
    q_organization_name: "Arsenal Capital Partners"
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/organizations/search',
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
        try {
          const result = JSON.parse(data);
          console.log('Organizations found:', result.organizations?.length || 0);
          if (result.organizations && result.organizations.length > 0) {
            console.log('First org:', result.organizations[0].name);
            console.log('Org ID:', result.organizations[0].id);
          }
          console.log('\nFull response:', JSON.stringify(result, null, 2).substring(0, 500));
          resolve(result);
        } catch (e) {
          console.log('Parse error:', e.message);
          console.log('Raw data:', data);
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

// Test 2: People search with correct endpoint
async function testPeopleSearch() {
  console.log('\n=== Test 2: People Search (mixed_people/search) ===');
  
  const payload = JSON.stringify({
    q_organization_name: "Arsenal Capital",
    person_titles: ["Partner", "Managing Director"],
    page: 1,
    per_page: 3
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.apollo.io',
      path: '/v1/mixed_people/search',
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
        try {
          const result = JSON.parse(data);
          console.log('People found:', result.people?.length || 0);
          console.log('\nFull response:', JSON.stringify(result, null, 2).substring(0, 500));
          resolve(result);
        } catch (e) {
          console.log('Parse error:', e.message);
          console.log('Raw data:', data);
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

(async () => {
  try {
    await testOrgSearch();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testPeopleSearch();
  } catch (error) {
    console.error('Test failed:', error);
  }
})();
