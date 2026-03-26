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

function apolloPeopleSearch(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/search',
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Api-Key':API_KEY,'Content-Length':Buffer.byteLength(data)}
    }, res => {
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){reject(e)}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // Get all rows
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  const rows = res.data.values || [];
  const header = rows[0];
  const data = rows.slice(1);

  // Find firms with no contact
  const noContact = [];
  data.forEach((row, idx) => {
    if (!row[1] || !row[1].trim()) {
      noContact.push({ name: row[0], website: row[4] || '', rowIdx: idx + 2 }); // +2 for 1-indexed + header
    }
  });

  console.log(`Found ${noContact.length} firms with 0 contacts. Starting enrichment...`);

  let enriched = 0;
  let failed = 0;
  let batchUpdates = [];

  for (let i = 0; i < noContact.length; i++) {
    const firm = noContact[i];
    try {
      // Search for senior people at this company
      const domain = firm.website ? new URL(firm.website).hostname.replace('www.', '') : null;
      
      const searchParams = {
        person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'Principal', 'Vice President', 'Director', 'CEO', 'Founder', 'Co-Founder', 'Chief Operating Officer', 'COO', 'President'],
        per_page: 3,
        page: 1,
      };

      if (domain) {
        searchParams.q_organization_domains = domain;
      } else {
        searchParams.q_organization_name = firm.name;
      }

      const result = await apolloPeopleSearch(searchParams);
      
      if (result.people && result.people.length > 0) {
        const person = result.people[0]; // Take the top result
        const contactName = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
        const title = person.title || '';
        const email = person.email || '';

        batchUpdates.push({
          range: `Sheet1!B${firm.rowIdx}:D${firm.rowIdx}`,
          values: [[contactName, title, email]]
        });
        enriched++;

        // If there are more contacts, add them as additional rows? No — just update the primary for now.
        // Add extra contacts as notes
        if (result.people.length > 1) {
          const extras = result.people.slice(1).map(p => {
            const n = p.name || `${p.first_name||''} ${p.last_name||''}`.trim();
            return `${n} (${p.title||'?'}) ${p.email||'no email'}`;
          }).join(' | ');
          // Append to notes column (K)
          const existingNotes = data[firm.rowIdx - 2][10] || '';
          batchUpdates.push({
            range: `Sheet1!K${firm.rowIdx}`,
            values: [[existingNotes ? `${existingNotes}. Alt contacts: ${extras}` : `Alt contacts: ${extras}`]]
          });
        }
      } else {
        failed++;
      }

      // Batch write every 25 firms
      if (batchUpdates.length >= 25) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { valueInputOption: 'RAW', data: batchUpdates }
        });
        batchUpdates = [];
        console.log(`[${new Date().toLocaleTimeString()}] Progress: ${i+1}/${noContact.length} processed | ${enriched} enriched | ${failed} no results`);
      }

      await sleep(400); // Rate limit
    } catch (err) {
      console.error(`Error on ${firm.name}: ${err.message}`);
      failed++;
      await sleep(1000);
    }
  }

  // Flush remaining
  if (batchUpdates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: batchUpdates }
    });
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total processed: ${noContact.length}`);
  console.log(`Enriched: ${enriched}`);
  console.log(`No results: ${failed}`);

  // Re-check totals
  const finalRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:D'
  });
  const finalRows = finalRes.data.values || [];
  const finalData = finalRows.slice(1);
  const finalWithContact = finalData.filter(r => r[1] && r[1].trim()).length;
  console.log(`\nFinal CRM: ${finalData.length} firms, ${finalWithContact} with contacts (${finalData.length - finalWithContact} still empty)`);
}

main().catch(console.error);
