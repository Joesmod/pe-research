const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Get spreadsheet metadata
  console.log('=== Spreadsheet Metadata ===');
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  
  console.log('Sheet tabs:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`  - ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows, ${sheet.properties.gridProperties.columnCount} cols)`);
  });

  // Read the first sheet with more range
  console.log('\n=== Reading PE Firms Outreach Tracker ===');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'PE Firms Outreach Tracker!A1:P5',
  });

  const rows = response.data.values || [];
  console.log(`\nFound ${rows.length} rows`);
  
  rows.forEach((row, idx) => {
    console.log(`\nRow ${idx}:`);
    row.forEach((cell, cellIdx) => {
      console.log(`  [${cellIdx}] ${cell}`);
    });
  });
}

main();
