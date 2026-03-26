const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apiCall(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { reject(d); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // Try people match by name + domain
  const targets = [
    { first: 'Stephens', last: 'Johnson', domain: 'tenexcm.com' },
    { first: 'Jason', last: 'Kyser', domain: 'jmi.com' },
    { first: 'Walt', last: 'Conrad', domain: 'sunstonepartners.com' },
    { first: 'Andrew', last: 'Wilkins', domain: 'atlanticstreetcapital.com' },
  ];

  for (const t of targets) {
    console.log(`\n=== ${t.first} ${t.last} @ ${t.domain} ===`);
    const r = await apiCall('/api/v1/people/match', {
      first_name: t.first,
      last_name: t.last,
      organization_domain: t.domain
    });
    if (r.person) {
      const p = r.person;
      console.log(`  ${p.first_name} ${p.last_name} | ${p.title} | ${p.email || 'NO EMAIL'} | ${p.email_status || ''} | ${p.linkedin_url || ''}`);
    } else {
      console.log('  Not found. Response:', JSON.stringify(r).substring(0, 200));
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
