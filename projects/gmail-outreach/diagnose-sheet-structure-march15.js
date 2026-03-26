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
  
  // Read first 5 rows to inspect structure
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z5',
  });
  
  const rows = response.data.values;
  
  console.log('First 5 rows of the sheet:\n');
  rows.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`);
    row.forEach((cell, cellIdx) => {
      console.log(`  Col ${String.fromCharCode(65 + cellIdx)} (${cellIdx}): ${cell}`);
    });
    console.log('');
  });
}

main().catch(console.error);
