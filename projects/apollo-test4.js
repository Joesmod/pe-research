const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
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
  // Enrich a person by ID
  const personId = '60ff0916b3ad3f0001bfbbc8'; // Carl from Thoma Bravo
  
  console.log('=== People Enrichment ===');
  const r = await post('/api/v1/people/match', {
    id: personId,
    reveal_personal_emails: false,
    reveal_phone_number: false,
  });
  
  if (r.person) {
    const p = r.person;
    console.log(`Name: ${p.first_name} ${p.last_name}`);
    console.log(`Title: ${p.title}`);
    console.log(`Email: ${p.email}`);
    console.log(`Org: ${p.organization?.name}`);
    console.log(`LinkedIn: ${p.linkedin_url}`);
  } else {
    console.log(JSON.stringify(r).slice(0, 500));
  }
}
main().catch(e => console.error(e));
