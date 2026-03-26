const https = require('https');
const {google} = require('googleapis');

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
  // Step 1: Search for senior people at the company
  const searchRes = await apolloPost('/v1/mixed_people/api_search', {
    q_organization_name: companyName,
    person_titles: ['Managing Director', 'Partner', 'Principal', 'CEO', 'President', 'VP Business Development', 'Head of Business Development', 'Managing Partner', 'Senior Partner', 'Co-Founder'],
    page: 1, per_page: 5
  });
  
  if (!searchRes.people || searchRes.people.length === 0) return null;
  
  // Step 2: Pick best candidate (prefer has_email=true)
  let candidate = searchRes.people.find(p => p.has_email) || searchRes.people[0];
  
  // Step 3: Reveal full details via match
  await sleep(500);
  const matchRes = await apolloPost('/v1/people/match', { id: candidate.id, reveal_personal_emails: false });
  
  if (!matchRes.person) return null;
  const p = matchRes.person;
  
  return {
    name: p.name || `${p.first_name} ${p.last_name}`,
    title: p.title || '',
    email: p.email || null,
    emailStatus: p.email_status || '',
    linkedin: p.linkedin_url || ''
  };
}

async function main() {
  const auth = new google.auth.GoogleAuth({ keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A1:M200' });
  const rows = res.data.values;
  
  const missing = [];
  for (let i = 1; i < rows.length; i++) {
    if (!(rows[i][3] || '').trim()) missing.push({ row: i + 1, company: rows[i][0] || '' });
  }
  
  console.log(`${missing.length} companies need emails. Starting...`);
  let enriched = 0, noEmail = 0, noResults = 0;
  
  for (let idx = 0; idx < missing.length; idx++) {
    const { row, company } = missing[idx];
    console.log(`[${idx+1}/${missing.length}] ${company}`);
    
    try {
      const contact = await findContact(company);
      
      if (!contact) {
        console.log(`  ❌ No results`);
        noResults++;
        await sleep(1000);
        continue;
      }
      
      if (contact.email) {
        console.log(`  ✅ ${contact.name} | ${contact.title} | ${contact.email} [${contact.emailStatus}]`);
        // Update B:F (contact, title, email, skip website, linkedin)
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!B${row}:D${row}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[contact.name, contact.title, contact.email]] }
        });
        if (contact.linkedin) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID, range: `Sheet1!F${row}`,
            valueInputOption: 'RAW', requestBody: { values: [[contact.linkedin]] }
          });
        }
        // Status + notes
        const note = (rows[row-1][10] || '') + ` Apollo enriched ${new Date().toISOString().slice(0,10)}. ${contact.emailStatus}.`;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Sheet1!I${row}:K${row}`,
          valueInputOption: 'RAW', requestBody: { values: [['Enriched', rows[row-1][9] || '', note.trim()]] }
        });
        enriched++;
      } else {
        console.log(`  ⚠️ ${contact.name} (${contact.title}) - no email`);
        // Update name/title anyway
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Sheet1!B${row}:C${row}`,
          valueInputOption: 'RAW', requestBody: { values: [[contact.name, contact.title]] }
        });
        const note = (rows[row-1][10] || '') + ` Apollo: ${contact.name}, no email. ${contact.linkedin || ''} ${new Date().toISOString().slice(0,10)}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID, range: `Sheet1!K${row}`,
          valueInputOption: 'RAW', requestBody: { values: [[note.trim()]] }
        });
        noEmail++;
      }
    } catch(err) {
      console.log(`  ❌ Error: ${err.message}`);
      noResults++;
    }
    
    await sleep(1500); // rate limit
  }
  
  console.log(`\n=== DONE ===\nEmails found: ${enriched}\nNo email: ${noEmail}\nNo results: ${noResults}`);
}

main().catch(e => console.error(e));
