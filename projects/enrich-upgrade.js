const https = require('https');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
      headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve({ error: d }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Firms to upgrade - currently have media/IR/comms contacts, want decision-makers
const targets = [
  { row: 52, name: 'Summit Partners', domain: 'summitpartners.com' },
  { row: 61, name: 'BPOC', domain: 'bpoc.com' },
  { row: 62, name: 'Advent International', domain: 'adventinternational.com' },
  { row: 87, name: 'NextGen Growth Partners', domain: 'nextgengp.com' },
  { row: 91, name: 'Court Square Capital Partners', domain: 'courtsquare.com' },
  { row: 110, name: 'Sun Capital Partners', domain: 'suncappart.com' },
  { row: 271, name: 'Broad Sky Partners', domain: 'broadskypartners.com' },
  { row: 47, name: 'GreyLion', domain: 'greylion.com' },
  { row: 73, name: 'Transom Capital Group', domain: 'transomcap.com' },
  { row: 78, name: 'Lightyear Capital', domain: 'lycap.com' },
];

const SENIOR_TITLES = [
  'CEO', 'CTO', 'COO', 'CIO', 'CFO', 'CMO', 'Chief',
  'Managing Partner', 'Managing Director', 'Partner',
  'Principal', 'VP', 'Vice President', 'Director',
  'Head of', 'President', 'Founder'
];

(async () => {
  const results = [];
  
  for (const t of targets) {
    console.log(`\n--- ${t.name} (${t.domain}) ---`);
    
    // Step 1: Find org
    const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
      q_organization_name: t.name,
      page: 1,
      per_page: 5
    });
    await sleep(300);
    
    const orgs = orgRes.organizations || orgRes.accounts || [];
    let orgId = null;
    for (const o of orgs) {
      if (o.primary_domain === t.domain || (o.name || '').toLowerCase().includes(t.name.toLowerCase().split(' ')[0])) {
        orgId = o.id;
        console.log(`  Org found: ${o.name} (${o.id})`);
        break;
      }
    }
    if (!orgId && orgs.length > 0) {
      orgId = orgs[0].id;
      console.log(`  Using first org: ${orgs[0].name} (${orgId})`);
    }
    if (!orgId) {
      console.log('  No org found, skipping');
      continue;
    }
    
    // Step 2: Search people
    const peopleRes = await apolloPost('/api/v1/mixed_people/search', {
      organization_ids: [orgId],
      person_titles: ['CTO', 'Chief Technology Officer', 'Chief Operating Officer', 'COO',
        'Managing Director', 'Partner', 'Principal', 'VP Technology', 'VP Operations',
        'Vice President Technology', 'Head of Value Creation', 'Head of Portfolio Operations',
        'Director Technology', 'Director of Business Development', 'CEO'],
      page: 1,
      per_page: 10
    });
    await sleep(300);
    
    const people = peopleRes.people || [];
    console.log(`  Found ${people.length} people`);
    
    // Step 3: Enrich top candidates
    const enriched = [];
    for (const p of people.slice(0, 5)) {
      if (!p.id) continue;
      const matchRes = await apolloPost('/api/v1/people/match', { id: p.id });
      await sleep(300);
      
      const person = matchRes.person || {};
      if (person.email || person.first_name) {
        const info = {
          name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
          title: person.title || '',
          email: person.email || '',
          linkedin: person.linkedin_url || '',
          email_status: person.email_status || ''
        };
        enriched.push(info);
        console.log(`  ${info.name} | ${info.title} | ${info.email} (${info.email_status}) | ${info.linkedin}`);
      }
    }
    
    results.push({ ...t, enriched });
  }
  
  console.log('\n\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
})();
