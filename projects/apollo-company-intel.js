const path = require('path');
const https = require('https');
const http = require('http');
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
      let b=''; res.on('data',c=>b+=c); res.on('end',()=>{try{resolve(JSON.parse(b))}catch(e){resolve({error:b.slice(0,200)})}});
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' });
  const rows = res.data.values || [];
  const data = rows.slice(1);

  // Find firms with contacts but no sector/portfolio info
  const needsIntel = [];
  data.forEach((row, idx) => {
    const hasContact = row[1] && row[1].trim();
    const hasSector = row[6] && row[6].trim();
    const hasPortfolio = row[7] && row[7].trim();
    if (hasContact && (!hasSector || !hasPortfolio)) {
      needsIntel.push({
        name: row[0],
        website: row[4] || '',
        rowIdx: idx + 2,
      });
    }
  });

  console.log(`${needsIntel.length} firms need company intel. Starting...`);

  let enriched = 0, noResults = 0, errors = 0;
  let batchUpdates = [];
  const startTime = Date.now();

  for (let i = 0; i < needsIntel.length; i++) {
    const firm = needsIntel[i];
    try {
      // Search for org in Apollo
      const orgSearch = await post('/api/v1/mixed_companies/search', {
        q_organization_name: firm.name,
        per_page: 1, page: 1,
      });

      if (!orgSearch.organizations?.[0]) { noResults++; await sleep(300); continue; }

      const org = orgSearch.organizations[0];
      
      // Extract intel from Apollo org data
      const keywords = org.keywords || [];
      const industry = org.industry || '';
      const subIndustry = org.sub_industry || '';
      const shortDesc = org.short_description || '';
      const techStack = (org.current_technologies || []).slice(0, 10).map(t => t.name || t).join(', ');
      
      // Build sector focus from industry + keywords
      const sectorParts = [];
      if (industry) sectorParts.push(industry);
      if (subIndustry && subIndustry !== industry) sectorParts.push(subIndustry);
      // Add relevant keywords (filter out generic ones)
      const relevantKw = keywords.filter(k => 
        !['Private Equity', 'Investment Management', 'Financial Services', 'Finance'].includes(k)
      ).slice(0, 5);
      if (relevantKw.length) sectorParts.push(...relevantKw);
      
      const sectorFocus = sectorParts.join(', ') || '';
      
      // Build portfolio/description info
      let portfolioInfo = '';
      if (shortDesc) {
        // Extract any company names or focus areas from description
        portfolioInfo = shortDesc.slice(0, 300);
      }
      
      // Add tech stack to notes if interesting
      const techNote = techStack ? `Tech signals: ${techStack}` : '';

      if (sectorFocus || portfolioInfo) {
        const updates = [];
        if (sectorFocus) {
          updates.push({ range: `Sheet1!G${firm.rowIdx}`, values: [[sectorFocus]] });
        }
        if (portfolioInfo) {
          updates.push({ range: `Sheet1!H${firm.rowIdx}`, values: [[portfolioInfo]] });
        }
        // Append tech signals to notes
        if (techNote) {
          const existingNotes = data[firm.rowIdx - 2]?.[10] || '';
          const newNotes = existingNotes ? `${existingNotes}. ${techNote}` : techNote;
          updates.push({ range: `Sheet1!K${firm.rowIdx}`, values: [[newNotes]] });
        }
        batchUpdates.push(...updates);
        enriched++;
      } else {
        noResults++;
      }

      // Batch write every 20
      if (batchUpdates.length >= 40) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { valueInputOption: 'RAW', data: batchUpdates }
        });
        batchUpdates = [];
      }

      if ((i + 1) % 25 === 0) {
        const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
        console.log(`[${elapsed}m] ${i+1}/${needsIntel.length} | enriched: ${enriched} | no data: ${noResults} | errors: ${errors}`);
      }

      await sleep(300);
    } catch (err) {
      errors++;
      console.error(`Error on ${firm.name}: ${err.message}`);
      await sleep(1000);
    }
  }

  // Flush
  if (batchUpdates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: batchUpdates }
    });
  }

  // Final count
  const finalRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:H' });
  const finalData = (finalRes.data.values || []).slice(1);
  const withContact = finalData.filter(r => r[1] && r[1].trim());
  const withSector = withContact.filter(r => r[6] && r[6].trim()).length;
  const withPortfolio = withContact.filter(r => r[7] && r[7].trim()).length;

  console.log(`\n=== DONE ===`);
  console.log(`Processed: ${needsIntel.length} | Enriched: ${enriched} | No data: ${noResults} | Errors: ${errors}`);
  console.log(`CRM: ${withContact.length} firms w/ contacts | ${withSector} w/ sector | ${withPortfolio} w/ portfolio info`);
}

main().catch(console.error);
