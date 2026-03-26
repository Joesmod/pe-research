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

const targets = [
  {row:10, name:'Harvest Partners'},
  {row:29, name:'Seidler Equity Partners'},
  {row:70, name:'Renovus Capital Partners'},
  {row:131, name:'Blackford Capital'},
  {row:108, name:'Quad Partners'},
  {row:162, name:'Thomas H. Lee Partners'},
  {row:2, name:'Audax Private Equity'},
  {row:16, name:'JLL Partners'},
  {row:50, name:'Francisco Partners'},
  {row:41, name:'Aldrich Capital Partners'},
  {row:104, name:'Odyssey Investment Partners'},
  {row:195, name:'CIP Capital'},
];

async function main() {
  const res = await sheets.spreadsheets.values.get({spreadsheetId:SHEET_ID, range:'Sheet1!A:M'});
  const rows = res.data.values||[];
  const updates = [];
  let enriched = 0;

  for (const t of targets) {
    const row = rows[t.row-1];
    if (!row) { console.log(t.name + ': row not found'); continue; }
    console.log('--- ' + t.name + ' (row ' + t.row + ') ---');
    
    const orgSearch = await post('/api/v1/mixed_companies/search', {q_organization_name: t.name, per_page: 1, page: 1});
    const orgId = orgSearch.organizations?.[0]?.id;
    if (!orgId) { console.log('  No org found'); await sleep(300); continue; }
    console.log('  Org ID: ' + orgId);
    await sleep(300);

    const peopleSearch = await post('/api/v1/mixed_people/api_search', {
      organization_ids: [orgId],
      person_titles: ['CEO','President','Managing Partner','Partner','Managing Director','Principal','Founder',
        'COO','CTO','CFO','CMO','VP','Vice President','Director','Head of','Operating Partner'],
      per_page: 5, page: 1
    });
    
    if (!peopleSearch.people?.length) { console.log('  No people found'); await sleep(300); continue; }
    console.log('  Found ' + peopleSearch.people.length + ' people');
    await sleep(300);

    let found = false;
    for (const person of peopleSearch.people) {
      const enrich = await post('/api/v1/people/match', {id: person.id, reveal_personal_emails: false, reveal_phone_number: false});
      await sleep(300);
      if (enrich.person?.email) {
        const p = enrich.person;
        const name = ((p.first_name||'') + ' ' + (p.last_name||'')).trim();
        const title = p.title||'';
        const email = p.email;
        const linkedin = p.linkedin_url||'';
        // Skip generic emails
        if (/^(info@|sales@|ir@|contact@|press@|media@)/i.test(email)) {
          console.log('  Skipping generic: ' + email);
          continue;
        }
        console.log('  FOUND: ' + name + ' | ' + title + ' | ' + email);
        
        updates.push({range: 'Sheet1!B'+t.row+':D'+t.row, values: [[name, title, email]]});
        if (linkedin) updates.push({range: 'Sheet1!F'+t.row, values: [[linkedin]]});
        
        const existingNotes = row[10]||'';
        const noteAdd = 'Apollo enriched 2026-02-17.';
        updates.push({range: 'Sheet1!K'+t.row, values: [[existingNotes ? existingNotes + ' ' + noteAdd : noteAdd]]});
        updates.push({range: 'Sheet1!I'+t.row, values: [['Enriched']]});
        
        enriched++;
        found = true;
        break;
      }
    }
    if (!found) console.log('  No direct email found');
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {valueInputOption: 'RAW', data: updates}
    });
  }
  console.log('\nDone! ' + enriched + '/' + targets.length + ' firms enriched.');
}
main().catch(console.error);
