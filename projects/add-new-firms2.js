const path = require('path');
const {google} = require(path.join(__dirname, 'gmail-outreach', 'node_modules', 'googleapis'));
const {JWT} = require(path.join(__dirname, 'gmail-outreach', 'node_modules', 'google-auth-library'));
const creds = require(path.join(__dirname, 'gmail-outreach', 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function apolloPost(p, body) {
  const r = await fetch(`https://api.apollo.io/api/v1${p}`, {
    method:'POST', headers:{'Content-Type':'application/json','X-Api-Key':API_KEY}, body:JSON.stringify(body)
  });
  return r.json();
}

const TARGET_FIRMS = [
  'Odyssey Investment Partners',
  'Grey Mountain Partners',
  'Trive Capital',
  'Enlightenment Capital',
  'Monomoy Capital Partners',
  'LFM Capital',
  'Bow River Capital',
  'Lorient Capital',
  'Quad-C Management',
  'Blue Point Capital Partners',
];

const TITLES = ['CEO','CTO','COO','Managing Partner','Partner','Managing Director','Principal','VP','Director','Founder','Co-Founder','Operating Partner'];

async function main() {
  const crmRes = await sheets.spreadsheets.values.get({spreadsheetId: SHEET_ID, range: 'Sheet1!A:A'});
  const existing = new Set((crmRes.data.values||[]).flat().map(n=>n.toLowerCase().trim()));
  
  const results = [];
  let added = 0;

  for (const firmName of TARGET_FIRMS) {
    if (added >= 5) break;
    if (existing.has(firmName.toLowerCase())) { console.log(`SKIP: ${firmName}`); continue; }
    console.log(`\n=== ${firmName} ===`);
    
    const orgs = (await apolloPost('/mixed_companies/search', {q_organization_name: firmName, page:1, per_page:3})).organizations || [];
    if (!orgs.length) { console.log('Not in Apollo'); continue; }
    const org = orgs[0];
    console.log(`Found: ${org.name} | ${org.website_url}`);
    await sleep(400);

    const ppl = await apolloPost('/mixed_people/api_search', {organization_ids:[org.id], person_titles:TITLES, page:1, per_page:10});
    if (!ppl.people || !ppl.people.length) { console.log('No people'); continue; }

    let bestContact = null;
    for (const p of ppl.people.slice(0,5)) {
      await sleep(400);
      const e = await apolloPost('/people/match', {id: p.id});
      const per = e.person || {};
      console.log(`  ${per.first_name} ${per.last_name} | ${per.title} | ${per.email || 'NO EMAIL'}`);
      if (per.email && !bestContact) {
        bestContact = {name: `${per.first_name} ${per.last_name}`, title: per.title, email: per.email, linkedin: per.linkedin_url || ''};
      }
    }

    results.push({
      firm: org.name,
      website: org.website_url || '',
      linkedin: org.linkedin_url || '',
      sectorFocus: (org.keywords || []).slice(0,5).join(', '),
      contact: bestContact,
    });
    added++;
  }

  const newRows = [];
  for (const r of results) {
    const c = r.contact || {};
    newRows.push([
      r.firm, c.name||'', c.title||'', c.email||'', r.website, c.linkedin||r.linkedin,
      r.sectorFocus, '', c.email ? 'Enriched' : 'Needs Enrichment', '',
      `Added ${new Date().toISOString().split('T')[0]} via Apollo. Contact verified via Apollo enrichment.`, '', c.email ? '7' : '5',
    ]);
  }

  if (newRows.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID, range: 'Sheet1!A:M', valueInputOption: 'RAW',
      requestBody: { values: newRows }
    });
    console.log(`\nAdded ${newRows.length} new firms to CRM`);
  }
  console.log('\nFINAL:', JSON.stringify(results.map(r=>({firm:r.firm, contact:r.contact?.name, email:r.contact?.email})),null,2));
}

main().catch(console.error);
