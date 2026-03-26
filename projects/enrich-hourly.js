const https = require('https');
const { google } = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': APOLLO_KEY }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function enrichFirm(firmName, domain) {
  // Step 1: Find org
  const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_name: firmName, page: 1, per_page: 3
  });
  const org = orgRes.organizations?.[0] || orgRes.accounts?.[0];
  if (!org) return { firm: firmName, error: 'org not found' };
  
  await sleep(300);
  
  // Step 2: Search for senior people
  const titles = [
    'CEO', 'CTO', 'COO', 'CFO', 'CMO', 'Chief',
    'Managing Partner', 'Managing Director', 'Partner',
    'Head of', 'VP', 'Vice President', 'Director',
    'Principal', 'President', 'Founder'
  ];
  
  const peopleRes = await apolloPost('/api/v1/mixed_people/api_search', {
    organization_ids: [org.id],
    person_titles: titles,
    page: 1, per_page: 10
  });
  
  const people = peopleRes.people || [];
  if (!people.length) return { firm: firmName, orgId: org.id, error: 'no people found' };
  
  // Step 3: Enrich top people to get emails
  const results = [];
  for (const person of people.slice(0, 5)) {
    await sleep(300);
    const enrichRes = await apolloPost('/api/v1/people/match', { id: person.id });
    const p = enrichRes.person;
    if (p && p.email) {
      results.push({
        name: p.name || `${p.first_name} ${p.last_name}`,
        title: p.title,
        email: p.email,
        email_status: p.email_status,
        linkedin: p.linkedin_url
      });
    }
  }
  
  return { firm: firmName, orgId: org.id, contacts: results };
}

async function main() {
  // Firms to enrich - targeting weak contacts (media/IR/press) or dead leads with score >= 5
  const targets = [
    // Enriched but weak contacts (media/press/IR) - upgrade to decision makers
    { name: 'Sverica Capital Management', domain: 'sverica.com' },  // Score 7, no verified email
    { name: 'Tenex Capital Management', domain: 'tenexcm.com' },  // Dead Lead, Score pending
    { name: 'Bregal Sagemount', domain: 'sagemount.com' },  // Score 6
    { name: 'Norwest Equity Partners', domain: 'nep.com' },  // Score 5
    { name: 'Great Hill Partners', domain: 'greathillpartners.com' },  // Score 5
    { name: 'Vestar Capital Partners', domain: 'vestarcapital.com' },  // Score 5
    { name: 'RLJ Equity Partners', domain: 'rljequitypartners.com' },  // Score 4
    { name: 'Primus Capital', domain: 'primuscapital.com' },  // Score 5
    { name: 'Crestview Partners', domain: 'crestview.com' },  // Score 5
    { name: 'PSP Partners', domain: 'psppartners.com' },  // Score 5
    { name: 'Platte River Equity', domain: 'platteriverequity.com' },  // Score 6
    { name: 'CenterOak Partners', domain: 'centeroakpartners.com' },  // Score 6
  ];
  
  for (const t of targets) {
    console.log(`\n=== Enriching: ${t.name} ===`);
    try {
      const result = await enrichFirm(t.name, t.domain);
      console.log(JSON.stringify(result, null, 2));
    } catch(e) {
      console.log(`ERROR: ${e.message}`);
    }
    await sleep(500);
  }
}

main().catch(console.error);
