const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPeopleSearch(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/api_search',
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{
        console.log('Status:', res.statusCode);
        try{resolve(JSON.parse(b))}catch(e){console.log('Raw:', b.slice(0,500)); reject(e)}
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function main() {
  console.log('Testing Apollo people search...');
  const result = await apolloPeopleSearch({
    q_organization_domains: 'thoma-bravo.com',
    person_titles: ['Managing Partner', 'Partner', 'Managing Director'],
    per_page: 3,
    page: 1,
  });
  console.log('Keys:', Object.keys(result));
  console.log('Total:', result.pagination?.total_entries);
  console.log('Sample:', JSON.stringify(result).slice(0, 1000));
  if (result.people) {
    result.people.forEach(p => {
      console.log(`  ${p.first_name} ${p.last_name} | ${p.title} | ${p.email || 'no email'}`);
    });
  } else {
    console.log('Response keys:', Object.keys(result));
    console.log(JSON.stringify(result).slice(0, 500));
  }
}
main().catch(e => console.error('Error:', e));
