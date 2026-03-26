const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

async function checkContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // List all sheet tabs
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: CRM_SHEET_ID,
  });
  
  console.log('📑 Available sheets:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`  - ${sheet.properties.title}`);
  });
  
  // Try reading Contacts sheet
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: CRM_SHEET_ID,
      range: 'Contacts!A1:Z10',
    });
    
    const rows = res.data.values || [];
    console.log(`\n📊 Contacts sheet - First 10 rows:\n`);
    rows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row.slice(0, 8).join(' | '));
    });
    
  } catch (e) {
    console.log(`\n⚠️  No "Contacts" sheet found or error: ${e.message}`);
  }
}

checkContacts().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
