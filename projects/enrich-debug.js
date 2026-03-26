const https = require('https');
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({...body, api_key: APOLLO_KEY});
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: {'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve(buf));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  // Test 1: mixed_companies/search
  console.log('--- Test mixed_companies/search ---');
  let r = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_name: 'Blackford Capital', page: 1, per_page: 3
  });
  console.log(r.slice(0, 500));
  
  // Test 2: mixed_people/search with domain
  console.log('\n--- Test mixed_people/search ---');
  r = await apolloPost('/api/v1/mixed_people/search', {
    q_organization_domains: 'blackfordcapital.com',
    page: 1, per_page: 3
  });
  console.log(r.slice(0, 500));

  // Test 3: api_search
  console.log('\n--- Test api_search ---');
  r = await apolloPost('/api/v1/mixed_people/api_search', {
    q_organization_name: 'Blackford Capital',
    person_titles: ['Managing Partner','CEO','Partner'],
    page: 1, per_page: 3
  });
  console.log(r.slice(0, 500));
})();
