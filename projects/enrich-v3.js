const {google} = require('googleapis');
const https = require('https');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Api-Key': APOLLO_KEY
      }
    }, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); } catch(e) { reject(new Error(buf.slice(0,500))); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const TITLES = [
  'CEO','CTO','COO','CFO','CMO','President','Founder','Co-Founder',
  'Managing Partner','Partner','Managing Director','Principal',
  'Operating Partner','General Partner'
];

async function enrichFirm(name, domain) {
  console.log(`\n=== ${name} (${domain}) ===`);
  
  // Step 1: Find org ID
  await sleep(400);
  const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_name: name, page: 1, per_page: 5
  });
  
  const orgs = orgRes.organizations || orgRes.accounts || [];
  const cleanDomain = domain.replace('www.','');
  let org = orgs.find(o => {
    const d = (o.primary_domain || o.website_url || '').replace(/https?:\/\//,'').replace(/\/.*/,'');
    return d.includes(cleanDomain);
  }) || orgs[0];
  
  if (!org) {
    console.log('  No org found');
    return null;
  }
  console.log('  Org:', org.name, '| ID:', org.id);
  
  // Step 2: People search using api_search with org ID
  await sleep(400);
  const peopleRes = await apolloPost('/api/v1/mixed_people/api_search', {
    organization_ids: [org.id],
    person_titles: TITLES,
    page: 1, per_page: 10
  });
  
  const people = peopleRes.people || [];
  console.log('  People found:', people.length);
  if (people.length === 0) return null;
  
  // Step 3: Enrich
  for (const p of people.slice(0, 5)) {
    await sleep(400);
    const enriched = await apolloPost('/api/v1/people/match', { id: p.id });
    const person = enriched.person;
    if (person && person.email) {
      const isGeneric = /^(info|sales|ir|contact|hello|office|admin|general)@/i.test(person.email);
      if (!isGeneric) {
        console.log('  FOUND:', person.name, '|', person.title, '|', person.email);
        return { name: person.name, title: person.title, email: person.email, linkedin: person.linkedin_url || '' };
      }
    }
    console.log('  Skip:', (person||{}).name, '|', (person||{}).email || 'no email');
  }
  return null;
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M200'
  });
  const rows = r.data.values;
  
  const targets = [
    {row: 10, name: 'Harvest Partners', domain: 'harvestpartners.com'},
    {row: 16, name: 'JLL Partners', domain: 'jllpartners.com'},
    {row: 29, name: 'Seidler Equity Partners', domain: 'sepfunds.com'},
    {row: 61, name: 'PSG Equity', domain: 'psgequity.com'},
    {row: 70, name: 'Renovus Capital Partners', domain: 'renovuscapital.com'},
    {row: 131, name: 'Blackford Capital', domain: 'blackfordcapital.com'},
    {row: 162, name: 'Thomas H. Lee Partners', domain: 'thl.com'},
    {row: 196, name: 'Vance Street Capital', domain: 'vancestreetcapital.com'},
  ];
  
  const updates = [];
  
  for (const t of targets) {
    try {
      const result = await enrichFirm(t.name, t.domain);
      if (result) {
        const rowData = rows[t.row - 1];
        const existingNotes = rowData[10] || '';
        const newNote = `${existingNotes} | Apollo enriched 2026-02-18: ${result.name} (${result.title}), email via Apollo.`.slice(0,500);
        
        updates.push({
          range: `Sheet1!B${t.row}:F${t.row}`,
          values: [[result.name, result.title, result.email, rowData[4]||'', result.linkedin || rowData[5]||'']]
        });
        updates.push({ range: `Sheet1!I${t.row}`, values: [['Enriched']] });
        updates.push({ range: `Sheet1!K${t.row}`, values: [[newNote]] });
        console.log(`  >> Will update row ${t.row}`);
      }
    } catch(e) {
      console.error(`  ERROR for ${t.name}:`, e.message.slice(0,200));
    }
  }
  
  if (updates.length > 0) {
    console.log(`\nWriting ${updates.length} updates...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates }
    });
    console.log('Done!');
  } else {
    console.log('\nNo new enrichments found.');
  }
}

main().catch(e => console.error('FATAL:', e));
