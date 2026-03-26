/**
 * Inspect CRM structure to understand the data layout
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

async function inspect() {
  const sheets = await getSheets();
  
  // Get sheet metadata
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: CRM_SHEET_ID,
  });
  
  console.log('Available sheets:');
  metadata.data.sheets.forEach(s => {
    console.log(`  - ${s.properties.title}`);
  });
  
  // Read first 5 rows of Sheet1
  console.log('\n=== Sheet1 (first 5 rows) ===');
  const sheet1 = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:Z5',
  });
  (sheet1.data.values || []).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, row.slice(0, 10).join(' | '));
  });
  
  // Read first 5 rows of Contacts
  console.log('\n=== Contacts (first 5 rows) ===');
  const contacts = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Contacts!A1:Z5',
  });
  (contacts.data.values || []).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, row.slice(0, 10).join(' | '));
  });
}

inspect().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
