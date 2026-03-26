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

const TARGETS = [
  {row: 10, firm: 'Harvest Partners', domain: 'harvestpartners.com'},
  {row: 29, firm: 'Seidler Equity Partners', domain: 'sepfunds.com'},
];

const TITLES = ['CEO','Chief Executive Officer','Managing Partner','Partner','Managing Director','President','Founder','COO','CFO','CTO','CMO','VP','Director'];

async function run() {
  for (const t of TARGETS) {
    console.log(`\n=== ${t.firm} ===`);
    // Step 1: Find org
    const orgR = await post('/api/v1/mixed_companies/search', {q_organization_name: t.firm, page: 1, per_page: 5});
    await sleep(500);
    const org = (orgR.organizations || []).find(o => o.website_url && o.website_url.includes(t.domain));
    if (!org) { console.log('Org not found in Apollo'); continue; }
    console.log('Org:', org.id, org.name);
    
    // Step 2: Search people
    const pR = await post('/api/v1/mixed_people/api_search', {
      organization_ids: [org.id],
      person_titles: TITLES,
      page: 1, per_page: 10
    });
    await sleep(500);
    const people = pR.people || [];
    console.log('People found:', people.length);
    
    // Step 3: Enrich top candidates
    let bestContact = null;
    for (const p of people.slice(0, 5)) {
      const eR = await post('/api/v1/people/match', {id: p.id});
      await sleep(400);
      const person = eR.person || eR;
      if (person.email && !person.email.match(/^(info@|sales@|ir@|contact@)/i)) {
        console.log(`FOUND: ${person.first_name} ${person.last_name} | ${person.title} | ${person.email} | ${person.linkedin_url || ''}`);
        bestContact = person;
        break;
      } else {
        console.log(`No direct email: ${person.first_name || '?'} ${person.last_name || '?'} | ${person.title || '?'} | ${person.email || 'none'}`);
      }
    }
    
    if (bestContact) {
      const name = `${bestContact.first_name} ${bestContact.last_name}`;
      const title = bestContact.title || '';
      const email = bestContact.email;
      const li = bestContact.linkedin_url || '';
      // Update sheet
      const updates = [
        {range: `B${t.row}`, values: [[name]]},
        {range: `C${t.row}`, values: [[title]]},
        {range: `D${t.row}`, values: [[email]]},
        {range: `F${t.row}`, values: [[li]]},
        {range: `I${t.row}`, values: [['Enriched']]},
        {range: `K${t.row}`, values: [[`Apollo verified ${new Date().toISOString().slice(0,10)}`]]},
      ];
      for (const u of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: u.range,
          valueInputOption: 'RAW', requestBody: {values: u.values}
        });
      }
      console.log(`Updated row ${t.row}`);
    } else {
      console.log('No enriched contact found');
    }
  }
  console.log('\nDone!');
}
run().catch(e => console.error(e));
