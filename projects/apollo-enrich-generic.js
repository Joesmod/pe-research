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
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve({status:res.statusCode,...JSON.parse(b)})}catch(e){resolve({status:res.statusCode,raw:b.slice(0,200)})}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Firms with generic emails (info@, IR@, press@, pr@, contactus@, businessdevelopment@, media@) or missing contacts
const TARGETS = [
  { row: 10, firm: 'Harvest Partners', domain: 'harvestpartners.com' },
  { row: 13, firm: 'New Mountain Capital', domain: 'newmountaincapital.com' },
  { row: 16, firm: 'JLL Partners', domain: 'jllpartners.com' },
  { row: 19, firm: 'Gryphon Investors', domain: 'gryphoninvestors.com' },
  { row: 29, firm: 'Seidler Equity Partners', domain: 'sepfunds.com' },
  { row: 41, firm: 'Aldrich Capital Partners', domain: 'aldrichcap.com' },
  { row: 50, firm: 'Francisco Partners', domain: 'franciscopartners.com' },
  { row: 70, firm: 'Renovus Capital Partners', domain: 'renovuscapital.com' },
  { row: 108, firm: 'Quad Partners', domain: 'quadpartners.com' },
  { row: 118, firm: 'Keltic Financial Partners', domain: 'kelticfp.com' },
  { row: 131, firm: 'Blackford Capital', domain: 'blackfordcapital.com' },
  { row: 138, firm: 'Bertram Capital', domain: 'bertramcapital.com' },
  { row: 162, firm: 'Thomas H. Lee Partners', domain: 'thl.com' },
  { row: 180, firm: 'Consonance Capital', domain: 'consonancecapital.com' },
];

const SENIOR_TITLES = [
  'CEO', 'CTO', 'COO', 'CFO', 'CMO', 'President', 'Founder', 'Co-Founder',
  'Managing Partner', 'Partner', 'General Partner', 'Operating Partner',
  'Managing Director', 'Principal', 'Vice President',
  'Director of Business Development', 'Head of Business Development',
  'Director of Technology', 'Head of Value Creation', 'Head of Portfolio Operations',
];

async function enrichFirm(target) {
  console.log(`\n--- ${target.firm} (row ${target.row}) ---`);
  
  // Step 1: Find org ID
  const orgRes = await post('/api/v1/mixed_companies/search', { q_organization_name: target.firm, page: 1, per_page: 5 });
  await sleep(400);
  
  if (!orgRes.organizations || orgRes.organizations.length === 0) {
    console.log('  No org found in Apollo');
    return null;
  }
  
  // Find best match
  const org = orgRes.organizations.find(o => 
    o.primary_domain === target.domain || 
    (o.name && o.name.toLowerCase().includes(target.firm.split(' ')[0].toLowerCase()))
  ) || orgRes.organizations[0];
  
  console.log(`  Org: ${org.name} (${org.primary_domain}) id=${org.id}`);
  
  // Step 2: Search for senior people
  const peopleRes = await post('/api/v1/mixed_people/api_search', {
    organization_ids: [org.id],
    person_titles: SENIOR_TITLES,
    page: 1,
    per_page: 10,
  });
  await sleep(400);
  
  if (!peopleRes.people || peopleRes.people.length === 0) {
    console.log('  No people found');
    return null;
  }
  
  console.log(`  Found ${peopleRes.people.length} people`);
  
  // Step 3: Try to enrich top candidates (prefer BD, then partner-level, then any senior)
  for (const person of peopleRes.people.slice(0, 5)) {
    const enrichRes = await post('/api/v1/people/match', { id: person.id });
    await sleep(400);
    
    const p = enrichRes.person;
    if (!p) continue;
    
    const email = p.email;
    const name = p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim();
    const title = p.title || '';
    const linkedin = p.linkedin_url || '';
    
    // Skip generic emails
    if (!email || /^(info|sales|ir|contact|inquiries|general|press|pr|media|businessdevelopment|contactus|NMFCIR|IR)@/i.test(email)) {
      console.log(`  Skip ${name} (${title}) - generic/no email: ${email || 'none'}`);
      continue;
    }
    
    console.log(`  ✓ ${name} | ${title} | ${email} | ${linkedin}`);
    return { name, title, email, linkedin, source: 'Apollo API enrichment' };
  }
  
  console.log('  No direct emails found for any candidate');
  return null;
}

async function main() {
  const results = [];
  
  for (const target of TARGETS) {
    try {
      const result = await enrichFirm(target);
      results.push({ ...target, result });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ ...target, result: null, error: err.message });
    }
  }
  
  // Update sheet for successful enrichments
  console.log('\n\n=== UPDATING SHEET ===');
  const enriched = results.filter(r => r.result);
  
  for (const r of enriched) {
    const row = r.row;
    const d = r.result;
    // Columns: A=Company, B=Contact Name, C=Title, D=Email, F=LinkedIn, I=Status, K=Notes
    const updates = [
      { range: `B${row}`, values: [[d.name]] },
      { range: `C${row}`, values: [[d.title]] },
      { range: `D${row}`, values: [[d.email]] },
    ];
    if (d.linkedin) updates.push({ range: `F${row}`, values: [[d.linkedin]] });
    updates.push({ range: `I${row}`, values: [['Enriched']] });
    updates.push({ range: `K${row}`, values: [[`Apollo enrichment ${new Date().toISOString().slice(0,10)}. Source: ${d.source}`]] });
    
    for (const u of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID, range: u.range, valueInputOption: 'RAW', requestBody: { values: u.values }
      });
    }
    console.log(`  Updated row ${row}: ${r.firm} -> ${d.name} (${d.email})`);
  }
  
  console.log(`\n=== DONE: ${enriched.length}/${results.length} enriched ===`);
  
  // Summary
  console.log('\nSUMMARY:');
  for (const r of results) {
    const status = r.result ? `✓ ${r.result.name} <${r.result.email}>` : '✗ No direct email found';
    console.log(`  Row ${r.row} ${r.firm}: ${status}`);
  }
}

main().catch(console.error);
