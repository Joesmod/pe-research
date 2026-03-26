const https = require('https');
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_KEY }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(new Error(Buffer.concat(chunks).toString())); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const firms = [
    { name: 'Apax Partners', domain: 'apax.com' },
    { name: 'Parthenon Capital', domain: 'parthenoncapital.com' },
    { name: 'HGGC', domain: 'hggc.com' },
    { name: 'GTCR', domain: 'gtcr.com' },
  ];
  
  for (const f of firms) {
    console.log(`\n=== ${f.name} ===`);
    
    // Try org search with different params
    const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
      q_organization_name: f.name,
      page: 1,
      per_page: 5
    });
    
    console.log(`Org results: ${orgRes.organizations?.length || 0}`);
    if (orgRes.organizations?.length) {
      orgRes.organizations.slice(0, 3).forEach(o => {
        console.log(`  ${o.name} | ${o.primary_domain} | ${o.id}`);
      });
    }
    
    // Also try people/match directly
    await sleep(300);
    const matchRes = await apolloPost('/api/v1/people/match', {
      organization_name: f.name,
      organization_domain: f.domain
    });
    if (matchRes.person) {
      const p = matchRes.person;
      console.log(`Direct match: ${p.name} | ${p.title} | ${p.email} | ${p.linkedin_url}`);
    } else {
      console.log('No direct match');
    }
    
    await sleep(500);
  }
}

run().catch(e => console.error(e));
