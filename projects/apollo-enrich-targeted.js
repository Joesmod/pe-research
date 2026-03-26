const path = require('path');
const https = require('https');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

function post(apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path: apiPath, method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve({status:res.statusCode,...JSON.parse(b)})}catch(e){resolve({status:res.statusCode,raw:b.slice(0,500)})}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const TITLES = [
  'Managing Partner', 'Partner', 'Managing Director', 'Principal', 'Founder',
  'CEO', 'President', 'Vice President', 'Chief Executive Officer',
  'Chief Technology Officer', 'Chief Operating Officer',
  'Director', 'Operating Partner', 'Head of',
  'VP Operations', 'VP Technology', 'VP Business Development'
];

async function main() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' });
  const rows = res.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1);
  // Cols: A=0 Company, B=1 Contact, C=2 Title, D=3 Email, E=4 Website, F=5 LinkedIn, 
  //        G=6 Sector, H=7 Portfolio, I=8 Status, J=9 Last Contacted, K=10 Notes

  const needsEnrich = [];
  data.forEach((row, idx) => {
    const contact = (row[1] || '').trim();
    const email = (row[3] || '').trim();
    const status = (row[8] || '').trim();
    if (status === 'Enriched' || status === 'Dead Lead') return;
    const generic = /^(info@|sales@|ir@|contact@|office@|general@)/i.test(email);
    if (!contact || !email || generic) {
      needsEnrich.push({ name: row[0], website: row[4]||'', rowIdx: idx+2, contact, email, status, notes: row[10]||'' });
    }
  });

  const LIMIT = 15;
  const targets = needsEnrich.slice(0, LIMIT);
  console.log(`Found ${needsEnrich.length} needing enrichment, processing ${targets.length}`);

  let enriched = 0, failed = 0;
  const batchUpdates = [];
  const results = [];

  for (const firm of targets) {
    try {
      // Step 1: Find org
      const orgSearch = await post('/api/v1/mixed_companies/search', {
        q_organization_name: firm.name, per_page: 1, page: 1,
      });
      const orgId = orgSearch.organizations?.[0]?.id;
      if (!orgId) { console.log(`  ${firm.name}: org not found`); failed++; await sleep(300); continue; }

      // Step 2: People search
      await sleep(300);
      const peopleSearch = await post('/api/v1/mixed_people/api_search', {
        organization_ids: [orgId],
        person_titles: TITLES,
        per_page: 5, page: 1,
      });
      if (!peopleSearch.people?.length) { console.log(`  ${firm.name}: no people found`); failed++; await sleep(300); continue; }

      // Step 3: Try to enrich each person until we find one with email
      let found = null;
      for (const person of peopleSearch.people.slice(0, 3)) {
        await sleep(300);
        const enrich = await post('/api/v1/people/match', { id: person.id });
        if (enrich.person?.email && !enrich.person.email.match(/^(info@|sales@|ir@|contact@|office@)/i)) {
          found = enrich.person;
          break;
        }
      }

      if (!found) { console.log(`  ${firm.name}: no person with direct email`); failed++; await sleep(300); continue; }

      const name = `${found.first_name||''} ${found.last_name||''}`.trim();
      const title = found.title || '';
      const email = found.email || '';
      const linkedin = found.linkedin_url || '';

      console.log(`  ✓ ${firm.name}: ${name} (${title}) - ${email}`);

      // Update Contact, Title, Email
      batchUpdates.push({ range: `Sheet1!B${firm.rowIdx}:D${firm.rowIdx}`, values: [[name, title, email]] });
      // Update LinkedIn if we have it
      if (linkedin) {
        batchUpdates.push({ range: `Sheet1!F${firm.rowIdx}`, values: [[linkedin]] });
      }
      // Update Status to Enriched
      batchUpdates.push({ range: `Sheet1!I${firm.rowIdx}`, values: [['Enriched']] });
      // Update Notes with source
      const noteAdd = `Apollo enriched ${new Date().toISOString().slice(0,10)}`;
      const newNotes = firm.notes ? `${firm.notes}. ${noteAdd}` : noteAdd;
      batchUpdates.push({ range: `Sheet1!K${firm.rowIdx}`, values: [[newNotes]] });

      results.push({ firm: firm.name, contact: name, title, email });
      enriched++;
      await sleep(300);
    } catch (err) {
      console.error(`  ERROR ${firm.name}: ${err.message}`);
      failed++;
      await sleep(500);
    }
  }

  // Write all updates
  if (batchUpdates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: batchUpdates }
    });
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Processed: ${targets.length} | Enriched: ${enriched} | Failed: ${failed}`);
  results.forEach(r => console.log(`  ${r.firm}: ${r.contact} (${r.title}) - ${r.email}`));
}

main().catch(console.error);
