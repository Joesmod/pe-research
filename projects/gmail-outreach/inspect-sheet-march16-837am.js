/**
 * Inspect sheet structure to understand headers
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read first 5 rows
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:Z5',
  });
  
  const rows = res.data.values || [];
  
  console.log('📊 First 5 rows of Sheet1:\n');
  
  rows.forEach((row, i) => {
    console.log(`Row ${i}:`);
    row.forEach((cell, j) => {
      console.log(`  [${String.fromCharCode(65 + j)}] ${cell}`);
    });
    console.log('');
  });
}

inspectSheet().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
