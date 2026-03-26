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

async function searchCompany(name) {
  const r = await apiCall('/api/v1/mixed_companies/search', { q_organization_name: name, per_page: 3 });
  if (r.organizations && r.organizations.length > 0) return r.organizations[0];
  if (r.accounts && r.accounts.length > 0) return r.accounts[0];
  return null;
}

async function searchPeople(orgId, titles) {
  const r = await apiCall('/api/v1/mixed_people/api_search', {
    organization_ids: [orgId],
    person_titles: titles,
    per_page: 5
  });
  return r.people || [];
}

async function enrichPerson(personId) {
  const r = await apiCall('/api/v1/people/match', { id: personId });
  return r.person || null;
}

async function main() {
  const targets = [
    { firm: 'Sunstone Partners', titles: ['Managing Partner', 'Partner', 'Managing Director', 'Principal'] },
    { firm: 'Argonaut Private Equity', titles: ['Managing Partner', 'Partner', 'Managing Director', 'Principal', 'CEO', 'President'] },
    { firm: 'Tenex Capital Management', titles: ['Managing Director', 'Head of Business Development'] },
    { firm: 'JMI Equity', titles: ['Managing Director', 'Partner'] },
  ];

  for (const t of targets) {
    console.log(`\n=== ${t.firm} ===`);
    const org = await searchCompany(t.firm);
    if (!org) { console.log('  No org found'); continue; }
    console.log(`  Org: ${org.name} (${org.id})`);
    await new Promise(r => setTimeout(r, 300));

    const people = await searchPeople(org.id, t.titles);
    console.log(`  Found ${people.length} people`);
    for (const p of people.slice(0, 3)) {
      await new Promise(r => setTimeout(r, 300));
      const enriched = await enrichPerson(p.id);
      if (enriched) {
        console.log(`  ${enriched.first_name} ${enriched.last_name} | ${enriched.title} | ${enriched.email || 'NO EMAIL'} | ${enriched.email_status || ''} | ${enriched.linkedin_url || ''}`);
      }
    }
  }
}

main().catch(console.error);
