const https = require('https');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { resolve({ error: Buffer.concat(chunks).toString() }); }
      });
    });
    req.on('error', reject);
    req.end(data);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Firms with weak contacts (media/IR/press) to upgrade
const firms = [
  { name: 'Summit Partners', row: 52 },
  { name: 'BPOC', row: 61 },
  { name: 'Advent International', row: 62 },
  { name: 'Transom Capital Group', row: 73 },
  { name: 'Webster Equity Partners', row: 92 },
  { name: 'Sun Capital Partners', row: 110 },
  { name: 'Broad Sky Partners', row: 271 },
  { name: 'Court Square Capital Partners', row: 91 },
  { name: 'Bow River Capital', row: 67 },
  { name: 'Lightyear Capital', row: 78 },
];

const GOOD_TITLES = [
  'CEO', 'CTO', 'COO', 'CMO', 'CFO', 'CIO', 'Chief',
  'Managing Partner', 'Managing Director', 'Partner',
  'Director of Technology', 'Director of Operations', 'Director of Product',
  'VP Technology', 'VP Operations', 'VP Product', 'VP Digital',
  'Head of Value Creation', 'Head of Portfolio', 'Head of Business Development',
  'Operating Partner', 'Principal'
];

(async () => {
  for (const firm of firms) {
    console.log(`\n=== ${firm.name} (Row ${firm.row}) ===`);
    
    // Step 1: Find org
    await sleep(400);
    const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
      q_organization_name: firm.name, page: 1, per_page: 3
    });
    
    const orgs = orgRes.organizations || orgRes.accounts || [];
    if (!orgs.length) { console.log('No org found'); continue; }
    
    const org = orgs[0];
    const orgId = org.id;
    console.log(`Org: ${org.name} (${orgId})`);
    
    // Step 2: Search people with good titles
    await sleep(400);
    const peopleRes = await apolloPost('/api/v1/mixed_people/search', {
      organization_ids: [orgId],
      person_titles: ['CEO', 'CTO', 'COO', 'Managing Partner', 'Managing Director', 
        'Partner', 'Operating Partner', 'VP Technology', 'VP Operations',
        'Head of Value Creation', 'Head of Portfolio Operations', 'Director Technology',
        'Head of Business Development', 'Principal'],
      page: 1, per_page: 10
    });
    
    const people = peopleRes.people || [];
    console.log(`Found ${people.length} people`);
    
    if (!people.length) {
      // Try api_search
      await sleep(400);
      const apiRes = await apolloPost('/api/v1/mixed_people/api_search', {
        organization_ids: [orgId],
        person_titles: ['CEO', 'CTO', 'COO', 'Managing Partner', 'Managing Director', 'Partner', 'Operating Partner'],
        page: 1, per_page: 10
      });
      const apiPeople = apiRes.people || [];
      console.log(`api_search: ${apiPeople.length} people`);
      
      for (const p of apiPeople.slice(0, 5)) {
        await sleep(400);
        const match = await apolloPost('/api/v1/people/match', { id: p.id });
        const person = match.person || {};
        if (person.email) {
          console.log(`  MATCH: ${person.first_name} ${person.last_name} | ${person.title} | ${person.email} | ${person.linkedin_url || ''}`);
        } else {
          console.log(`  NO EMAIL: ${person.first_name || '?'} ${person.last_name || '?'} | ${person.title || '?'}`);
        }
      }
    } else {
      for (const p of people.slice(0, 5)) {
        if (p.email) {
          console.log(`  HIT: ${p.first_name} ${p.last_name} | ${p.title} | ${p.email} | ${p.linkedin_url || ''}`);
        } else {
          // Try match
          await sleep(400);
          const match = await apolloPost('/api/v1/people/match', { id: p.id });
          const person = match.person || {};
          if (person.email) {
            console.log(`  MATCH: ${person.first_name} ${person.last_name} | ${person.title} | ${person.email} | ${person.linkedin_url || ''}`);
          } else {
            console.log(`  NO EMAIL: ${p.first_name || '?'} ${p.last_name || '?'} | ${p.title || '?'}`);
          }
        }
      }
    }
  }
  console.log('\n=== DONE ===');
})();
