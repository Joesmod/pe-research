const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read first 5 rows to see structure
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M5',
  });
  
  const rows = res.data.values || [];
  
  console.log('First 5 rows of the sheet:\n');
  rows.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`);
    row.forEach((cell, cellIdx) => {
      console.log(`  Column ${String.fromCharCode(65 + cellIdx)}: ${cell || '[EMPTY]'}`);
    });
    console.log('');
  });
}

main().catch(console.error);
