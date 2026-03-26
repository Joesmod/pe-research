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

async function main() {
  // Get all rows
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' });
  const rows = res.data.values || [];
  const data = rows.slice(1);

  // Find firms with no contact
  const noContact = [];
  data.forEach((row, idx) => {
    if (!row[1] || !row[1].trim()) {
      noContact.push({ name: row[0], website: row[4] || '', rowIdx: idx + 2 });
    }
  });

  console.log(`${noContact.length} firms with 0 contacts. Starting...`);

  let enriched = 0, noResults = 0, errors = 0;
  let batchUpdates = [];
  const startTime = Date.now();

  for (let i = 0; i < noContact.length; i++) {
    const firm = noContact[i];
    try {
      // Step 1: Find org ID
      let orgId = null;
      const domain = firm.website ? (() => { try { return new URL(firm.website).hostname.replace('www.', ''); } catch(e) { return null; } })() : null;
      
      const orgSearch = await post('/api/v1/mixed_companies/search', {
        q_organization_name: firm.name,
        per_page: 1, page: 1,
      });
      
      if (orgSearch.organizations?.[0]) {
        orgId = orgSearch.organizations[0].id;
      }
      
      if (!orgId) { noResults++; await sleep(300); continue; }

      // Step 2: Find people at this org
      await sleep(300);
      const peopleSearch = await post('/api/v1/mixed_people/api_search', {
        organization_ids: [orgId],
        person_titles: ['Managing Partner', 'Partner', 'Managing Director', 'Principal', 'Founder', 'CEO', 'President', 'Vice President'],
        per_page: 3, page: 1,
      });

      if (!peopleSearch.people?.length) { noResults++; await sleep(300); continue; }

      // Step 3: Enrich top person
      await sleep(300);
      const enrich = await post('/api/v1/people/match', {
        id: peopleSearch.people[0].id,
        reveal_personal_emails: false,
        reveal_phone_number: false,
      });

      if (enrich.person) {
        const p = enrich.person;
        const name = `${p.first_name || ''} ${p.last_name || ''}`.trim();
        const title = p.title || '';
        const email = p.email || '';
        
        batchUpdates.push({
          range: `Sheet1!B${firm.rowIdx}:D${firm.rowIdx}`,
          values: [[name, title, email]]
        });
        enriched++;

        // Add alt contacts to notes if available
        if (peopleSearch.people.length > 1) {
          const altIds = peopleSearch.people.slice(1);
          const altNames = altIds.map(a => `${a.first_name || '?'} (${a.title || '?'})`).join(' | ');
          const existingNotes = data[firm.rowIdx - 2]?.[10] || '';
          batchUpdates.push({
            range: `Sheet1!K${firm.rowIdx}`,
            values: [[existingNotes ? `${existingNotes}. Alts: ${altNames}` : `Alts: ${altNames}`]]
          });
        }
      } else {
        noResults++;
      }

      // Batch write every 20 firms
      if (batchUpdates.length >= 20) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { valueInputOption: 'RAW', data: batchUpdates }
        });
        batchUpdates = [];
      }

      // Log progress every 25 firms
      if ((i + 1) % 25 === 0) {
        const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
        console.log(`[${elapsed}m] ${i+1}/${noContact.length} | enriched: ${enriched} | no results: ${noResults} | errors: ${errors}`);
      }

      await sleep(300);
    } catch (err) {
      errors++;
      console.error(`Error on ${firm.name}: ${err.message}`);
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

  // Final count
  const finalRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:D' });
  const finalData = (finalRes.data.values || []).slice(1);
  const finalWithContact = finalData.filter(r => r[1] && r[1].trim()).length;

  console.log(`\n=== DONE ===`);
  console.log(`Processed: ${noContact.length} | Enriched: ${enriched} | No results: ${noResults} | Errors: ${errors}`);
  console.log(`CRM total: ${finalData.length} firms | ${finalWithContact} with contacts | ${finalData.length - finalWithContact} still empty`);
}

main().catch(console.error);
