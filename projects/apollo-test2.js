const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{
        console.log(`${path} => ${res.statusCode}`);
        try{resolve(JSON.parse(b))}catch(e){console.log('Raw:', b.slice(0,500)); reject(e)}
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function main() {
  // Try the people/search endpoint
  console.log('=== Test 1: people/search ===');
  const r1 = await post('/api/v1/people/search', {
    q_organization_domains: 'thoma-bravo.com',
    person_titles: ['Partner'],
    per_page: 3, page: 1,
  });
  console.log(JSON.stringify(r1).slice(0, 500));

  console.log('\n=== Test 2: mixed_people/search ===');
  const r2 = await post('/api/v1/mixed_people/search', {
    q_organization_domains: 'thoma-bravo.com',
    person_titles: ['Partner'],
    per_page: 3, page: 1,
  });
  console.log(JSON.stringify(r2).slice(0, 500));

  console.log('\n=== Test 3: api_search with organization_domains ===');
  const r3 = await post('/api/v1/mixed_people/api_search', {
    organization_domains: ['thoma-bravo.com'],
    person_titles: ['Partner'],
    per_page: 3, page: 1,
  });
  console.log(JSON.stringify(r3).slice(0, 500));
}
main().catch(e => console.error(e));
