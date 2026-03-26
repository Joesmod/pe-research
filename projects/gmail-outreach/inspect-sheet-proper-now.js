const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function inspect() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:Z10',  // First 10 rows
  });
  
  const rows = res.data.values || [];
  
  console.log('📊 First 10 rows of Sheet1:\n');
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`, row.slice(0, 10).join(' | '));
  });
  
  console.log('\n🔎 Likely headers (Row 1):', rows[0]);
  console.log('\n🔎 Sample data (Row 2):', rows[1]);
  
  // Check for empty/generic emails in first 50 rows
  const headers = rows[0] || [];
  const emailCol = headers.findIndex(h => h && h.toLowerCase().includes('email'));
  const contactCol = headers.findIndex(h => h && (h.toLowerCase().includes('contact') || h.toLowerCase().includes('name')));
  const companyCol = headers.findIndex(h => h && (h.toLowerCase().includes('company') || h.toLowerCase().includes('firm')));
  
  console.log(`\n🔎 Found columns:`);
  console.log(`  Company: ${companyCol} (${headers[companyCol]})`);
  console.log(`  Contact: ${contactCol} (${headers[contactCol]})`);
  console.log(`  Email: ${emailCol} (${headers[emailCol]})`);
}

inspect().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
