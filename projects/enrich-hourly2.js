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
        catch(e) { reject(new Error(Buffer.concat(chunks).toString())); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function enrichByDomain(firmName, domain) {
  // Use org search with domain
  const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_domains: domain, page: 1, per_page: 1
  });
  
  let orgId = null;
  if (orgRes.organizations?.length) orgId = orgRes.organizations[0].id;
  else if (orgRes.accounts?.length) orgId = orgRes.accounts[0].id;
  
  if (!orgId) {
    // Try people search directly by domain
    console.log(`  No org for domain ${domain}, trying people search...`);
    const pRes = await apolloPost('/api/v1/mixed_people/api_search', {
      q_organization_domains: [domain],
      person_titles: ['CEO', 'CTO', 'COO', 'Partner', 'Managing Director', 'VP', 'Director', 'Head', 'Principal', 'President'],
      page: 1, per_page: 10
    });
    // api_search doesn't support q_organization_domains, try match approach
    if (!pRes.people?.length) {
      return { firm: firmName, domain, error: 'no org/people found' };
    }
  }
  
  await sleep(300);
  
  if (orgId) {
    const peopleRes = await apolloPost('/api/v1/mixed_people/api_search', {
      organization_ids: [orgId],
      person_titles: ['CEO', 'CTO', 'COO', 'CFO', 'Partner', 'Managing Director', 'Managing Partner', 'VP', 'Vice President', 'Director', 'Head', 'Principal', 'President', 'Founder'],
      page: 1, per_page: 10
    });
    
    const people = peopleRes.people || [];
    if (!people.length) return { firm: firmName, domain, orgId, error: 'no people found' };
    
    const results = [];
    for (const person of people.slice(0, 5)) {
      await sleep(300);
      try {
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
      } catch(e) { /* skip */ }
    }
    return { firm: firmName, domain, orgId, contacts: results };
  }
  
  return { firm: firmName, domain, error: 'no org found' };
}

async function main() {
  const targets = [
    { name: 'Sverica Capital Management', domain: 'sverica.com' },
    { name: 'Tenex Capital Management', domain: 'tenexcm.com' },
    { name: 'Bregal Sagemount', domain: 'sagemount.com' },
    { name: 'Norwest Equity Partners', domain: 'nep.com' },
    { name: 'Great Hill Partners', domain: 'greathillpartners.com' },
    { name: 'Vestar Capital Partners', domain: 'vestarcapital.com' },
    { name: 'RLJ Equity Partners', domain: 'rljequitypartners.com' },
    { name: 'Primus Capital', domain: 'primuscapital.com' },
    { name: 'Crestview Partners', domain: 'crestview.com' },
    { name: 'PSP Partners', domain: 'psppartners.com' },
    { name: 'Platte River Equity', domain: 'platteriverequity.com' },
    { name: 'CenterOak Partners', domain: 'centeroakpartners.com' },
  ];
  
  for (const t of targets) {
    console.log(`\n=== ${t.name} (${t.domain}) ===`);
    try {
      const result = await enrichByDomain(t.name, t.domain);
      if (result.contacts?.length) {
        for (const c of result.contacts) {
          console.log(`  ✅ ${c.name} | ${c.title} | ${c.email} (${c.email_status}) | ${c.linkedin}`);
        }
      } else {
        console.log(`  ❌ ${result.error || 'no contacts with emails'}`);
      }
    } catch(e) {
      console.log(`  ERROR: ${e.message}`);
    }
    await sleep(500);
  }
}

main().catch(console.error);
