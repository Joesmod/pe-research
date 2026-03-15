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

  // Try "Tracker" tab
  console.log('=== Reading "Tracker" tab ===');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tracker!A1:P10',
  });

  const rows = response.data.values || [];
  console.log(`Found ${rows.length} rows`);
  
  rows.forEach((row, idx) => {
    console.log(`\nRow ${idx}:`);
    row.forEach((cell, cellIdx) => {
      console.log(`  [${String.fromCharCode(65 + cellIdx)}] ${cell || ''}`);
    });
  });
}

main();
