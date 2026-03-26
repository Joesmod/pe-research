const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const {google} = require('googleapis');
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TITLES = [
  'CEO','CTO','COO','CFO','CMO','President','Founder','Co-Founder',
  'Managing Partner','Operating Partner','General Partner','Partner',
  'Managing Director','Principal',
  'VP','Vice President',
  'Director','Head'
];

const HDRS = {'Content-Type':'application/json','X-Api-Key':API_KEY};

async function apolloCompanySearch(name) {
  const r = await fetch('https://api.apollo.io/api/v1/mixed_companies/search', {
    method: 'POST', headers: HDRS,
    body: JSON.stringify({q_organization_name: name, per_page: 1})
  });
  const d = await r.json();
  return d.organizations?.[0] || null;
}

async function apolloPeopleSearch(orgId) {
  const r = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
    method: 'POST', headers: HDRS,
    body: JSON.stringify({
      api_key: API_KEY,
      organization_ids: [orgId],
      person_titles: TITLES,
      per_page: 5
    })
  });
  const d = await r.json();
  return d.people || [];
}

async function apolloEnrich(personId) {
  const r = await fetch('https://api.apollo.io/api/v1/people/match', {
    method: 'POST', headers: HDRS,
    body: JSON.stringify({id: personId})
  });
  return await r.json();
}

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: '../projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({spreadsheetId: SHEET_ID, range: 'A1:M200'});
  const rows = res.data.values;
  const headers = rows[0];
  console.log('Headers:', headers.join(' | '));

  // Find rows needing enrichment
  const generic = ['info@','sales@','ir@','contact@','inquiries@'];
  const targets = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const contact = (row[1]||'').trim();
    const email = (row[3]||'').trim();
    const status = (row[8]||'').trim();
    const needsEnrich = !contact || !email || generic.some(g => email.toLowerCase().startsWith(g));
    if (needsEnrich && status !== 'Enriched') {
      targets.push({idx: i, row: i+1, company: row[0], currentStatus: status});
    }
  }
  console.log(`Found ${targets.length} rows needing enrichment`);

  for (const t of targets) {
    console.log(`\n--- Enriching: ${t.company} (row ${t.row}) ---`);
    try {
      const org = await apolloCompanySearch(t.company);
      if (!org) { console.log('  Company not found in Apollo'); continue; }
      console.log(`  Apollo org: ${org.name} (${org.id})`);
      await sleep(300);

      const people = await apolloPeopleSearch(org.id);
      if (!people.length) { console.log('  No people found'); continue; }
      console.log(`  Found ${people.length} people`);
      await sleep(300);

      // Try to enrich first person with email
      let enriched = null;
      for (const p of people.slice(0, 3)) {
        const e = await apolloEnrich(p.id);
        await sleep(300);
        if (e.person && e.person.email && !generic.some(g => e.person.email.toLowerCase().startsWith(g))) {
          enriched = e.person;
          break;
        }
      }

      if (!enriched) { console.log('  No direct email found'); continue; }
      console.log(`  ENRICHED: ${enriched.name} | ${enriched.title} | ${enriched.email} | ${enriched.linkedin_url||''}`);

      // Update sheet
      // Cols: A=Company, B=Contact Name, C=Title, D=Email, E=Website, F=LinkedIn, ...I=Status, K=Notes
      const updates = [
        {range: `B${t.row}`, values: [[enriched.name]]},
        {range: `C${t.row}`, values: [[enriched.title||'']]},
        {range: `D${t.row}`, values: [[enriched.email]]},
        {range: `F${t.row}`, values: [[enriched.linkedin_url||'']]},
        {range: `I${t.row}`, values: [['Enriched']]},
        {range: `K${t.row}`, values: [[`Apollo enriched ${new Date().toISOString().split('T')[0]}. Verified via Apollo match.`]]}
      ];
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {valueInputOption: 'RAW', data: updates}
      });
      console.log('  Sheet updated!');

    } catch(e) {
      console.log(`  ERROR: ${e.message}`);
    }
  }
  console.log('\nDone!');
})();
