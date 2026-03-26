const https = require('https');
const KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apiCall(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve(b)}}); });
    req.on('error', reject); req.write(data); req.end();
  });
}

async function main() {
  // Test api_search with full response
  const res = await apiCall('/api/v1/mixed_people/api_search', {
    q_organization_name: 'TA Associates',
    person_titles: ['Managing Partner', 'Partner', 'Managing Director'],
    per_page: 3, page: 1
  });
  console.log('Full response:');
  console.log(JSON.stringify(res, null, 2).slice(0, 3000));
}
main().catch(console.error);
