const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
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
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({raw: d}); } });
    });
    req.on('error', reject);
    req.end(data);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const targets = [
  {name:'Bregal Sagemount', domain:'sagemount.com'},
  {name:'Sverica Capital', domain:'sverica.com'},
  {name:'Resurgens Technology Partners', domain:'resurgenstech.com'},
  {name:'Thompson Street Capital', domain:'tscp.com'},
  {name:'TZP Group', domain:'tzpgroup.com'},
  {name:'Trive Capital', domain:'trivecapital.com'},
  {name:'Ridgemont Equity Partners', domain:'ridgemontep.com'},
  {name:'Union Capital Associates', domain:'unioncapitalassociates.com'},
  {name:'Dynamic Core Capital', domain:'dynamiccorecapital.com'},
  {name:'Pritzker Private Capital', domain:'ppcpartners.com'},
  {name:'Summit Park', domain:'summitparkllc.com'},
  {name:'Coral Tree Partners', domain:'coraltreelp.com'},
  {name:'Crescendo Capital', domain:'crescendotrust.com'},
];

async function run() {
  const results = {};
  for (const t of targets) {
    console.log(`\n=== ${t.name} ===`);
    results[t.name] = [];
    
    const res = await apolloPost('/api/v1/mixed_people/api_search', {
      q_organization_domains: t.domain,
      page: 1,
      per_page: 10
    });
    await sleep(400);
    
    const people = res.people || [];
    if (!people.length) { console.log('  NO PEOPLE'); continue; }
    
    for (const p of people.slice(0, 6)) {
      try {
        const enriched = await apolloPost('/api/v1/people/match', { id: p.id });
        await sleep(400);
        const per = enriched.person;
        if (per) {
          const line = `  ${per.name || 'N/A'} | ${per.title || 'N/A'} | ${per.email || 'NO EMAIL'} | ${per.linkedin_url || ''}`;
          console.log(line);
          results[t.name].push({name: per.name, title: per.title, email: per.email, linkedin: per.linkedin_url});
        } else {
          console.log(`  [enrich failed for ${p.id}]`);
        }
      } catch(e) {
        console.log(`  [error: ${e.message}]`);
      }
    }
  }
}

run().catch(e => console.error(e));
