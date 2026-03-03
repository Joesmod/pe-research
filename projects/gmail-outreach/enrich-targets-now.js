const https = require('https');
const {google} = require('googleapis');
const fs = require('fs');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'x-api-key': APOLLO_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d)); } });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function findContact(companyName) {
  try {
    // Broad search - CTO, Partner, MD, VP Tech, Head of Tech, VP BD
    const searchRes = await apolloPost('/v1/mixed_people/search', {
      q_organization_name: companyName,
      person_titles: ['CTO', 'Chief Technology Officer', 'Managing Partner', 'Partner', 'Managing Director', 'VP Technology', 'Head of Technology', 'VP Business Development', 'Head of Business Development', 'Director of Technology', 'VP Operations', 'Chief Operating Officer', 'COO'],
      page: 1, per_page: 10
    });
    
    if (!searchRes.people || searchRes.people.length === 0) return null;
    
    // Pick best candidate (prefer has_email=true)
    let candidate = searchRes.people.find(p => p.email) || searchRes.people[0];
    
    if (!candidate) return null;
    
    // If no email yet, try to enrich
    if (!candidate.email && candidate.id) {
      await sleep(500);
      const matchRes = await apolloPost('/v1/people/match', { id: candidate.id, reveal_personal_emails: false });
      if (matchRes.person) candidate = matchRes.person;
    }
    
    return {
      name: candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
      title: candidate.title || '',
      email: candidate.email || null,
      linkedin: candidate.linkedin_url || ''
    };
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    return null;
  }
}

async function main() {
  const auth = new google.auth.GoogleAuth({ keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Load current sheet
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M500' });
  const rows = res.data.values;
  
  // Find targets: Empty contact OR generic email, NOT Contacted/Dead End
  const targets = [];
  for (let i = 1; i < rows.length; i++) {
    const company = (rows[i][0] || '').trim();
    const contact = (rows[i][1] || '').trim();
    const email = (rows[i][3] || '').trim();
    const status = (rows[i][8] || '').trim();
    
    if (!company) continue;
    if (status === 'Contacted' || status.startsWith('Dead')) continue;
    
    const emptyContact = !contact;
    const genericEmail = /^(info@|sales@|ir@|contact@|investor@)/i.test(email);
    
    if (emptyContact || genericEmail) {
      targets.push({ row: i + 1, company, contact, email, status });
    }
  }
  
  console.log(`Found ${targets.length} firms needing enrichment`);
  console.log(`Processing first 15...\n`);
  
  let enriched = 0, noResults = 0;
  
  for (let idx = 0; idx < Math.min(15, targets.length); idx++) {
    const { row, company, status } = targets[idx];
    console.log(`[${idx+1}/15] ${company} (Status: ${status})`);
    
    try {
      const contact = await findContact(company);
      
      if (!contact || !contact.email) {
        console.log(`  ❌ No verified contact found`);
        noResults++;
        await sleep(1500);
        continue;
      }
      
      console.log(`  ✅ ${contact.name} | ${contact.title} | ${contact.email}`);
      
      // Update B:D (contact, title, email)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!B${row}:D${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[contact.name, contact.title, contact.email]] }
      });
      
      // Update LinkedIn if available
      if (contact.linkedin) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Sheet1!F${row}`,
          valueInputOption: 'RAW', requestBody: { values: [[contact.linkedin]] }
        });
      }
      
      // Update notes + status
      const oldNotes = rows[row-1][10] || '';
      const newNote = `${oldNotes} Apollo enriched ${new Date().toISOString().slice(0,10)}.`.trim();
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID, range: `Sheet1!I${row}:K${row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Enriched', '', newNote]] }
      });
      
      enriched++;
      await sleep(1500);
      
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      await sleep(2000);
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Enriched: ${enriched}`);
  console.log(`No results: ${noResults}`);
}

main().catch(console.error);
