/**
 * Inspect Sheet1 structure properly
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function inspectSheet() {
  const sheets = await getSheets();
  
  // Read first 10 rows of Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:Z10',
  });
  
  const rows = res.data.values || [];
  
  console.log('First 10 rows of Sheet1:\n');
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`);
    row.forEach((cell, j) => {
      const col = String.fromCharCode(65 + j); // A, B, C...
      console.log(`  ${col}: ${cell}`);
    });
    console.log('');
  });
}

inspectSheet().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
