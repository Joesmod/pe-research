const https = require('https');
const {google} = require('googleapis');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.apollo.io', path, method,
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY }
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opts, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { resolve({ error: Buffer.concat(chunks).toString().slice(0,500) }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Try domain-based org search, then people
async function enrichByDomain(name, domain) {
  console.log(`\n--- ${name} (${domain}) ---`);
  
  // Try org search by domain
  const orgRes = await apiCall('POST', '/api/v1/mixed_companies/search', {
    q_organization_domains: domain,
    page: 1, per_page: 3
  });
  
  let orgId = null;
  if (orgRes.accounts && orgRes.accounts.length > 0) {
    orgId = orgRes.accounts[0].id;
    console.log(`  Org found: ${orgRes.accounts[0].name} (${orgId})`);
  } else {
    console.log(`  No org by domain either`);
    return null;
  }
  
  await sleep(400);
  
  // People search
  const peopleRes = await apiCall('POST', '/api/v1/mixed_people/api_search', {
    organization_ids: [orgId],
    person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'Principal',
      'CEO', 'CTO', 'COO', 'CFO', 'President', 'Vice President',
      'Head of Business Development', 'Director', 'Founder',
      'Head of Technology', 'Chief Technology Officer'],
    page: 1, per_page: 10
  });
  
  if (!peopleRes.people || peopleRes.people.length === 0) {
    console.log(`  No people found`);
    return null;
  }
  
  console.log(`  Found ${peopleRes.people.length} people`);
  const results = [];
  
  for (const person of peopleRes.people.slice(0, 5)) {
    await sleep(400);
    const match = await apiCall('POST', '/api/v1/people/match', { id: person.id });
    const p = match.person || {};
    if (p.email) {
      console.log(`  ✓ ${p.name} - ${p.title} - ${p.email}`);
      results.push({ name: p.name, title: p.title, email: p.email, emailStatus: p.email_status, linkedin: p.linkedin_url });
    } else {
      console.log(`  ✗ ${p.name || '?'} - no email`);
    }
  }
  return results;
}

// Targets with domains
const TARGETS = [
  { row: 61, name: 'BPOC', domain: 'bpoc.com' },
  { row: 62, name: 'Advent International', domain: 'adventinternational.com' },
  { row: 238, name: 'Aquiline Capital Partners', domain: 'aquiline.com' },
  { row: 271, name: 'Broad Sky Partners', domain: 'broadskypartners.com' },
  { row: 249, name: 'Tenex Capital Management', domain: 'tenexcm.com' },
  { row: 261, name: 'RoundTable Healthcare Partners', domain: 'roundtablehp.com' },
  { row: 92, name: 'Webster Equity Partners', domain: 'websterequitypartners.com' },
  { row: 194, name: 'CIP Capital', domain: 'cip-capital.com' },
  { row: 197, name: 'Guardian Capital Partners', domain: 'guardiancp.com' },
  { row: 300, name: 'Avante Capital Partners', domain: 'avantecap.com' },
];

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const sheetData = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M300'
  });
  const rows = sheetData.data.values;
  
  const updates = [];
  const contactsToAdd = [];
  
  for (const target of TARGETS) {
    const rowIdx = target.row - 1;
    const currentRow = rows[rowIdx];
    if (!currentRow) continue;
    
    console.log(`\n========== ROW ${target.row}: ${target.name} ==========`);
    console.log(`  Current: ${currentRow[1] || 'N/A'} | ${currentRow[3] || 'N/A'} | Status: ${currentRow[8] || 'N/A'}`);
    
    try {
      const results = await enrichByDomain(target.name, target.domain);
      if (!results || results.length === 0) continue;
      
      // Pick best: tech > BD > partner
      const tech = results.filter(r => /cto|chief technology|chief information|head of tech|vp.*tech|ai|digital|portfolio.*op|value creation/i.test(r.title));
      const bd = results.filter(r => /business development/i.test(r.title));
      const partner = results.filter(r => /managing partner|partner|managing director|ceo|president|founder/i.test(r.title));
      const best = tech[0] || bd[0] || partner[0] || results[0];
      
      if (!best || !best.email) continue;
      
      // Only update if upgrade (better role than current)
      const currentTitle = (currentRow[2] || '').toLowerCase();
      const isUpgrade = /press|media|communications|ir |investor relation|deals contact|info@/i.test(currentTitle + ' ' + (currentRow[3] || ''));
      const noEmail = !currentRow[3];
      
      if (isUpgrade || noEmail) {
        console.log(`  >> UPGRADING to: ${best.name} - ${best.title} - ${best.email}`);
        const prevNote = currentRow[10] || '';
        updates.push({
          range: `Sheet1!B${target.row}:K${target.row}`,
          values: [[
            best.name, best.title, best.email,
            currentRow[4] || '', best.linkedin || currentRow[5] || '',
            currentRow[6] || '', currentRow[7] || '',
            'Enriched', currentRow[9] || '',
            `UPGRADED via Apollo domain search 2026-02-24. ${best.name} (${best.title}). ${results.length} contacts found. Previous: ${currentRow[1] || 'N/A'}. ${prevNote.slice(0,250)}`
          ]]
        });
      } else {
        console.log(`  Current contact looks fine, not upgrading. Found: ${best.name} - ${best.title}`);
      }
      
      // Add all to Contacts
      for (const r of results) {
        if (r.email) {
          contactsToAdd.push([target.name, '', r.name, r.title, r.email, r.emailStatus || 'verified', r.linkedin || '', `Apollo domain enrichment 2026-02-24`]);
        }
      }
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
    await sleep(500);
  }
  
  if (updates.length > 0) {
    console.log(`\nApplying ${updates.length} Sheet1 updates...`);
    for (const u of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID, range: u.range,
        valueInputOption: 'RAW', requestBody: { values: u.values }
      });
      console.log(`  Updated ${u.range}`);
    }
  }
  
  if (contactsToAdd.length > 0) {
    console.log(`\nAppending ${contactsToAdd.length} contacts...`);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID, range: 'Contacts!A:I',
      valueInputOption: 'RAW', requestBody: { values: contactsToAdd }
    });
  }
  
  console.log(`\n=== DONE === Updates: ${updates.length} | Contacts: ${contactsToAdd.length}`);
}

run().catch(e => console.error('FATAL:', e.message));
