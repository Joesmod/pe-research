const {google} = require('googleapis');
const axios = require('axios');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TITLES = [
  'CEO', 'CTO', 'COO', 'CFO', 'CMO', 'Chief Technology Officer', 'Chief Operating Officer',
  'Managing Partner', 'Partner', 'Managing Director', 'Principal', 'Founder', 'President',
  'VP', 'Vice President', 'Director', 'Head of',
  'Operating Partner', 'General Partner'
];

async function searchCompany(name) {
  const {data} = await axios.post('https://api.apollo.io/api/v1/mixed_companies/search', {
    q_organization_name: name, page: 1, per_page: 3
  }, {headers: {'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json'}});
  if (data.organizations && data.organizations.length > 0) return data.organizations[0];
  // Try accounts
  if (data.accounts && data.accounts.length > 0) return data.accounts[0];
  return null;
}

async function searchPeople(orgId) {
  const {data} = await axios.post('https://api.apollo.io/api/v1/mixed_people/search', {
    organization_ids: [orgId],
    person_titles: TITLES,
    page: 1, per_page: 10
  }, {headers: {'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json'}});
  return data.people || [];
}

async function enrichPerson(personId) {
  const {data} = await axios.post('https://api.apollo.io/api/v1/people/match', {
    id: personId
  }, {headers: {'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json'}});
  return data.person || null;
}

async function main() {
  const firms = [
    {row: 307, company: 'Argonaut Private Equity'},
    {row: 329, company: 'Pritzker Group Private Capital'},
    {row: 338, company: 'Frontenac Company'},
    {row: 368, company: 'Calvert Street Investment Partners'},
    {row: 369, company: 'Caprae Capital Partners'},
    {row: 374, company: 'Infinity Capital Partners'},
    {row: 407, company: 'FlexFunds'},
    {row: 478, company: 'Palm Beach Capital'},
    {row: 500, company: 'Aurora Capital Partners'},
    {row: 475, company: 'Lux Capital'},
    {row: 485, company: 'Stronghold Investment Management'},
    {row: 456, company: 'Cambridge Capital LLC'},
  ];

  // Also enrich Seth Brody at Apax on Contacts sheet
  const contactsEnrich = [{row: 49, company: 'Apax Partners', name: 'Seth Brody'}];

  const results = [];

  for (const firm of firms) {
    try {
      console.log(`\n--- ${firm.company} ---`);
      const org = await searchCompany(firm.company);
      await sleep(300);
      if (!org) { console.log('  No org found'); results.push({...firm, found: false}); continue; }
      console.log(`  Org: ${org.name} (${org.id})`);
      
      const people = await searchPeople(org.id);
      await sleep(300);
      console.log(`  Found ${people.length} people`);
      
      // Try to enrich the best candidate
      let best = null;
      for (const p of people.slice(0, 5)) {
        const enriched = await enrichPerson(p.id);
        await sleep(300);
        if (enriched && enriched.email) {
          best = enriched;
          console.log(`  ✓ ${enriched.first_name} ${enriched.last_name} - ${enriched.title} - ${enriched.email} - ${enriched.linkedin_url||''}`);
          break;
        }
        if (enriched) console.log(`  ✗ ${enriched.first_name} ${enriched.last_name} - no email`);
      }
      results.push({...firm, found: !!best, person: best});
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      results.push({...firm, found: false, error: e.message});
    }
  }

  // Apax - Seth Brody
  for (const c of contactsEnrich) {
    try {
      console.log(`\n--- Contacts: ${c.name} @ ${c.company} ---`);
      const {data} = await axios.post('https://api.apollo.io/api/v1/people/match', {
        first_name: 'Seth', last_name: 'Brody', organization_name: 'Apax Partners'
      }, {headers: {'X-Api-Key': APOLLO_KEY, 'Content-Type': 'application/json'}});
      const p = data.person;
      if (p && p.email) {
        console.log(`  ✓ ${p.first_name} ${p.last_name} - ${p.title} - ${p.email} - ${p.linkedin_url||''}`);
        results.push({...c, found: true, person: p, isContact: true});
      } else {
        console.log('  No email found');
        results.push({...c, found: false, isContact: true});
      }
    } catch(e) {
      console.log(`  ERROR: ${e.message}`);
    }
  }

  // Write results for sheet update
  console.log('\n\n=== RESULTS ===');
  console.log(JSON.stringify(results.filter(r=>r.found), null, 2));
}

main().catch(e => console.error(e));
