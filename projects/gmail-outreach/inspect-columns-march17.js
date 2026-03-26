/**
 * Inspect first 30 rows to understand data structure
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function inspectColumns() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:N30',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 First 30 rows:\n`);
  
  rows.slice(0, 30).forEach((row, idx) => {
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || row[9] || '';
    
    console.log(`Row ${idx + 1}: ${company}`);
    console.log(`  Contact: ${contact}`);
    console.log(`  Email: ${email}`);
    console.log(`  Status: ${status}\n`);
  });
}

inspectColumns().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
