const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🔍 Fetching Unresearched Targets - March 8, 5:36 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1);

  const colMap = {};
  headers.forEach((h, i) => { colMap[h] = i; });

  // Target "New - Unresearched" leads
  const targets = [];
  data.forEach((row, idx) => {
    const status = row[colMap['Status']] || '';
    const company = row[colMap['Company Name']] || '';
    const website = row[colMap['Website']] || '';
    
    if (status === 'New - Unresearched' && company) {
      targets.push({
        row: idx + 2, // +2 for 1-indexed + header
        company,
        website,
        sector: row[colMap['Sector Focus']] || '',
        notes: row[colMap['Notes']] || ''
      });
    }
  });

  console.log(`Found ${targets.length} unresearched leads.\n`);
  
  if (targets.length > 0) {
    console.log('First 15 targets:');
    targets.slice(0, 15).forEach(t => {
      console.log(`Row ${t.row}: ${t.company} | ${t.website || '(no website)'}`);
    });
    
    // Save to JSON for enrichment
    const outputPath = path.join(__dirname, 'enrich-targets-march8-536am.json');
    fs.writeFileSync(outputPath, JSON.stringify(targets, null, 2));
    console.log(`\n✅ Saved ${targets.length} targets to: enrich-targets-march8-536am.json`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
