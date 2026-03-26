const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY }
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch(e) { resolve({raw: buf}); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const targets = [
    { name: 'Stephens Johnson', org: 'Tenex Capital Management', domain: 'tenexcm.com' },
    { name: 'Mark Beith', org: 'Apax Partners', domain: 'apax.com' },
    { name: 'Craig Collister', org: 'RoundTable Healthcare Partners', domain: 'roundtablehp.com' },
    { name: 'Jason Kyser', org: 'JMI Equity', domain: 'jmiequity.com' },
    { name: 'Kamil Salame', org: 'Cranemere Group', domain: 'cranemere.com' },
    { name: 'Nishita Cummings', org: 'Kayne Partners', domain: 'kaynepartners.com' },
    { name: 'Natalie Yates', org: 'Vance Street Capital', domain: 'vancestreetcapital.com' },
    { name: 'Erin Rathke', org: 'Petra Fund', domain: 'petrafund.com' },
    { name: 'Erica Curello', org: 'Mainsail Partners', domain: 'mainsailpartners.com' },
    { name: 'Dave Finley', org: 'Sverica Capital', domain: 'sverica.com' },
    { name: 'Andrew Wilkins', org: 'Atlantic Street Capital', domain: 'atlanticstreetcapital.com' },
    { name: 'Nick Matzke', org: 'Behrman Capital', domain: 'behrmancap.com' },
  ];

  for (const t of targets) {
    console.log(`\n=== ${t.name} @ ${t.org} ===`);
    try {
      const res = await apolloPost('/api/v1/people/match', {
        name: t.name,
        organization_name: t.org,
        domain: t.domain
      });
      const p = res.person;
      if (p) {
        console.log(`  Name: ${p.first_name} ${p.last_name}`);
        console.log(`  Title: ${p.title}`);
        console.log(`  Email: ${p.email} (${p.email_status})`);
        console.log(`  LinkedIn: ${p.linkedin_url}`);
        console.log(`  Org: ${p.organization?.name}`);
      } else {
        console.log('  No match. Raw:', JSON.stringify(res).substring(0, 200));
      }
    } catch(e) {
      console.log('  ERROR:', e.message);
    }
    await sleep(500);
  }
}

main();
