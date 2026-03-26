const https = require('https');
const KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apiCall(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path: path,
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve(b)}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function main() {
  // Check the error on people search
  const res = await apiCall('/api/v1/mixed_people/search', {
    q_organization_name: 'Thoma Bravo',
    person_titles: ['Partner'],
    page: 1,
    per_page: 3
  });
  console.log('People search error:', JSON.stringify(res));

  // Try the /v1/people/search endpoint instead
  const res2 = await apiCall('/v1/people/search', {
    q_organization_name: 'Thoma Bravo',
    person_titles: ['Partner'],
    page: 1,
    per_page: 3
  });
  console.log('\n/v1/people/search:', JSON.stringify(res2).slice(0,500));

  // Also try /api/v1/people/search
  const res3 = await apiCall('/api/v1/people/search', {
    q_organization_name: 'Thoma Bravo',
    person_titles: ['Partner'],
    page: 1,
    per_page: 3
  });
  console.log('\n/api/v1/people/search keys:', Object.keys(res3));
  if (res3.people) {
    console.log('Found', res3.people.length, 'people');
    res3.people.forEach(function(p) { console.log('  ' + p.name + ' | ' + p.title + ' | ' + (p.email || 'no email')); });
  }
  if (res3.error) console.log('Error:', JSON.stringify(res3.error));
}

main().catch(console.error);
