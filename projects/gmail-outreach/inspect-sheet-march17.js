/**
 * Inspect Google Sheet structure to understand column layout
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read first few rows to understand structure
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:Z10',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows fetched: ${rows.length}\n`);
  
  // Print each row with column indices
  rows.forEach((row, idx) => {
    console.log(`\nRow ${idx}:`);
    row.forEach((cell, colIdx) => {
      const letter = String.fromCharCode(65 + colIdx);
      console.log(`  ${letter}${idx + 1}: ${cell || '(empty)'}`);
    });
  });
}

inspectSheet().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
