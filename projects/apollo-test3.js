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
        try{resolve(JSON.parse(b))}catch(e){console.log('Raw:', b.slice(0,300)); reject(e)}
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function main() {
  // Test api_search with proper filter names per docs
  console.log('=== api_search with q_organization_domains ===');
  const r1 = await post('/api/v1/mixed_people/api_search', {
    q_organization_domains: 'thoma-bravo.com',
    person_titles: ['Partner'],
    per_page: 3, page: 1,
  });
  console.log('Total:', r1.total_entries);
  if (r1.people?.[0]) console.log('First:', JSON.stringify(r1.people[0]).slice(0,300));

  // Test with organization_ids - first get org id
  console.log('\n=== org search for thoma bravo ===');
  const r2 = await post('/api/v1/mixed_companies/search', {
    q_organization_name: 'Thoma Bravo',
    per_page: 1, page: 1,
  });
  if (r2.organizations?.[0]) {
    const org = r2.organizations[0];
    console.log(`Org: ${org.name} | ID: ${org.id} | Domain: ${org.primary_domain}`);

    console.log('\n=== api_search with organization_ids ===');
    const r3 = await post('/api/v1/mixed_people/api_search', {
      organization_ids: [org.id],
      person_titles: ['Partner', 'Managing Partner', 'Managing Director'],
      per_page: 5, page: 1,
    });
    console.log('Total:', r3.total_entries);
    r3.people?.forEach(p => console.log(`  ${p.first_name} ${p.last_name_obfuscated||''} | ${p.title} | email:${p.has_email} | id:${p.id}`));
  }
}
main().catch(e => console.error(e));
