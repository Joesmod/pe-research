const {google} = require('googleapis');
const https = require('https');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path,
      method: 'POST',
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

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function enrichFirm(firmName, domain) {
  console.log(`\n=== ${firmName} (${domain}) ===`);
  
  // Step 1: Find org
  const orgRes = await apolloPost('/api/v1/mixed_companies/search', {
    q_organization_name: firmName,
    page: 1,
    per_page: 3
  });
  
  const org = orgRes.organizations?.find(o => 
    o.name?.toLowerCase().includes(firmName.toLowerCase().split(' ')[0]) ||
    o.primary_domain === domain
  );
  
  if (!org) {
    console.log('No org found');
    return null;
  }
  console.log(`Org: ${org.name} (${org.id})`);
  
  await sleep(300);
  
  // Step 2: Search people
  const titles = [
    'CEO', 'CTO', 'COO', 'CMO', 'CFO',
    'Managing Partner', 'Partner', 'Managing Director', 'Principal',
    'Director', 'VP', 'Head of'
  ];
  
  const peopleRes = await apolloPost('/api/v1/mixed_people/api_search', {
    organization_ids: [org.id],
    person_titles: titles,
    page: 1,
    per_page: 10
  });
  
  const people = peopleRes.people || [];
  console.log(`Found ${people.length} people`);
  
  const results = [];
  for (const p of people.slice(0, 5)) {
    await sleep(300);
    const enriched = await apolloPost('/api/v1/people/match', { id: p.id });
    const person = enriched.person;
    if (person && person.email) {
      console.log(`  ${person.name} | ${person.title} | ${person.email} | ${person.linkedin_url}`);
      results.push(person);
    }
  }
  
  return results;
}

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  // Firms to enrich
  const targets = [
    { firm: 'Apax Partners', domain: 'apax.com', contactRow: 49 },
    { firm: 'Parthenon Capital Partners', domain: 'parthenoncapital.com', contactRow: 316 },
    { firm: 'Harvest Partners', domain: 'harvestpartners.com', contactRow: 432, existingEmail: 'kgriffin@harvestpartners.com' },
    { firm: 'HGGC', domain: 'hggc.com', contactRow: 457, existingEmail: 'cshen@hggc.com' },
    { firm: 'GTCR', domain: 'gtcr.com', contactRow: 476, existingEmail: 'julia.x@gtcr.com' },
  ];
  
  for (const t of targets) {
    const results = await enrichFirm(t.firm, t.domain);
    
    if (results && results.length > 0) {
      const best = results[0];
      // Update Contacts sheet
      const range = `Contacts!C${t.contactRow}:H${t.contactRow}`;
      const values = [[
        best.name,
        best.title || '',
        best.email,
        'verified',
        best.linkedin_url || '',
        `Apollo verified ${new Date().toISOString().split('T')[0]}. ${results.length > 1 ? 'Also: ' + results.slice(1).map(r => `${r.name} (${r.email})`).join(', ') : ''}`
      ]];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values }
      });
      console.log(`  Updated Contacts row ${t.contactRow}`);
    } else {
      console.log(`  No results for ${t.firm}`);
    }
    
    await sleep(500);
  }
}

run().catch(e => console.error(e));
