const https = require('https');
const {google} = require('googleapis');

const API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Firms to try enriching - weak contacts or dead leads worth retrying
const TARGETS = [
  // Weak contacts (press/media/IR) that could be upgraded
  { row: 61, name: 'BPOC', note: 'Press contact only, score 1' },
  { row: 62, name: 'Advent International', note: 'Head of Comms, score 2' },
  { row: 92, name: 'Webster Equity Partners', note: 'Deals contact, score 2' },
  { row: 135, name: 'Leeds Equity Partners', note: 'Dir IR, score 2' },
  { row: 194, name: 'CIP Capital', note: 'Score 1, COO but needs upgrade' },
  { row: 197, name: 'Guardian Capital Partners', note: 'Score 2, needs upgrade' },
  { row: 238, name: 'Aquiline Capital Partners', note: 'Media inquiries, score 3' },
  { row: 271, name: 'Broad Sky Partners', note: 'Media & Press, score 3' },
  // Dead leads worth retrying
  { row: 249, name: 'Tenex Capital Management', note: 'Active firm, no email' },
  { row: 261, name: 'RoundTable Healthcare Partners', note: 'No email' },
];

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.apollo.io',
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
      }
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opts, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch(e) { resolve({ error: Buffer.concat(chunks).toString().slice(0,200) }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const SENIOR_TITLES = [
  'CEO', 'CTO', 'COO', 'CFO', 'CMO', 'CIO', 'CISO',
  'Managing Partner', 'Partner', 'Managing Director', 'Principal',
  'Founder', 'President', 'Vice President',
  'Head of', 'Director of', 'SVP', 'Senior Vice President'
];

async function enrichFirm(name) {
  console.log(`\n--- Searching Apollo for: ${name} ---`);
  
  // Step 1: Find org
  const orgRes = await apiCall('POST', '/api/v1/mixed_companies/search', {
    q_organization_name: name,
    page: 1,
    per_page: 3
  });
  
  if (!orgRes.accounts || orgRes.accounts.length === 0) {
    console.log(`  No org found for ${name}`);
    return null;
  }
  
  const org = orgRes.accounts[0];
  console.log(`  Org: ${org.name} (${org.id})`);
  
  await sleep(400);
  
  // Step 2: Search people
  const peopleRes = await apiCall('POST', '/api/v1/mixed_people/api_search', {
    organization_ids: [org.id],
    person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'Principal',
      'CEO', 'CTO', 'COO', 'CFO', 'President', 'Vice President',
      'Head of Business Development', 'Director', 'Founder',
      'Head of Value Creation', 'Head of Portfolio Operations',
      'Head of Technology', 'Chief Technology Officer', 'Chief AI Officer'],
    page: 1,
    per_page: 10
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
      console.log(`  ✓ ${p.name} - ${p.title} - ${p.email} (${p.email_status || 'unknown'})`);
      results.push({
        name: p.name,
        title: p.title,
        email: p.email,
        emailStatus: p.email_status,
        linkedin: p.linkedin_url
      });
    } else {
      console.log(`  ✗ ${p.name || person.id} - no email`);
    }
  }
  
  return results;
}

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read current sheet
  const sheetData = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M300'
  });
  const rows = sheetData.data.values;
  const headers = rows[0];
  console.log('Headers:', headers);
  
  const updates = [];
  const contactsToAdd = [];
  
  for (const target of TARGETS) {
    const rowIdx = target.row - 1; // 0-indexed
    const currentRow = rows[rowIdx];
    if (!currentRow) {
      console.log(`Row ${target.row} not found, skipping`);
      continue;
    }
    
    console.log(`\n========== ROW ${target.row}: ${target.name} ==========`);
    console.log(`  Current: ${currentRow[1] || 'N/A'} | ${currentRow[2] || 'N/A'} | ${currentRow[3] || 'N/A'}`);
    console.log(`  Status: ${currentRow[8] || 'N/A'} | Note: ${target.note}`);
    
    try {
      const results = await enrichFirm(target.name);
      
      if (!results || results.length === 0) {
        console.log(`  NO RESULTS - skipping`);
        continue;
      }
      
      // Pick the best contact (prioritize tech/ops roles, then partners)
      const techRoles = results.filter(r => 
        /cto|chief technology|chief information|head of technology|vp.*tech|director.*tech|ai|digital|portfolio.*op|value creation/i.test(r.title)
      );
      const partnerRoles = results.filter(r =>
        /managing partner|partner|managing director|ceo|president|founder/i.test(r.title)
      );
      const bdRoles = results.filter(r =>
        /business development|bd|capital formation/i.test(r.title)
      );
      
      const best = techRoles[0] || bdRoles[0] || partnerRoles[0] || results[0];
      
      if (best && best.email) {
        console.log(`  >> BEST: ${best.name} - ${best.title} - ${best.email}`);
        
        // Update Sheet1
        const currentNotes = currentRow[10] || '';
        const newNote = `UPGRADED via Apollo enrichment 2026-02-24. ${best.name} (${best.title}, ${best.email}). ${results.length} total contacts found. Previous: ${currentRow[1] || 'N/A'}. ${currentNotes.slice(0, 300)}`;
        
        updates.push({
          range: `Sheet1!B${target.row}:K${target.row}`,
          values: [[
            best.name,
            best.title,
            best.email,
            currentRow[4] || '', // website
            best.linkedin || currentRow[5] || '', // linkedin
            currentRow[6] || '', // sector
            currentRow[7] || '', // portfolio
            'Enriched',
            currentRow[9] || '', // last contacted
            newNote
          ]]
        });
        
        // Add all contacts to Contacts sheet
        for (const r of results) {
          if (r.email) {
            contactsToAdd.push([
              target.name,
              '', // gumbo score
              r.name,
              r.title,
              r.email,
              r.emailStatus || 'verified',
              r.linkedin || '',
              `Apollo enrichment 2026-02-24`
            ]);
          }
        }
      }
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
    
    await sleep(500);
  }
  
  // Apply updates to Sheet1
  if (updates.length > 0) {
    console.log(`\n\nApplying ${updates.length} Sheet1 updates...`);
    for (const u of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: u.range,
        valueInputOption: 'RAW',
        requestBody: { values: u.values }
      });
      console.log(`  Updated ${u.range}`);
    }
  }
  
  // Add contacts
  if (contactsToAdd.length > 0) {
    console.log(`\nAppending ${contactsToAdd.length} contacts...`);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Contacts!A:I',
      valueInputOption: 'RAW',
      requestBody: { values: contactsToAdd }
    });
    console.log('  Done.');
  }
  
  console.log('\n=== ENRICHMENT COMPLETE ===');
  console.log(`Sheet1 updates: ${updates.length}`);
  console.log(`Contacts added: ${contactsToAdd.length}`);
}

run().catch(e => console.error('FATAL:', e.message));
