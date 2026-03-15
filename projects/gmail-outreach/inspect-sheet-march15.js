const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function inspect() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:O50'
  });
  
  const rows = response.data.values || [];
  
  console.log('Headers:', rows[0]);
  console.log('');
  console.log('Total rows:', rows.length - 1);
  console.log('');
  console.log('Sample rows (first 10):');
  
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    console.log(`  Company: ${row[0] || '(empty)'}`);
    console.log(`  Contact: ${row[2] || '(empty)'}`);
    console.log(`  Email: ${row[4] || '(empty)'}`);
    console.log(`  Status: ${row[14] || '(empty)'}`);
  }
}

inspect().catch(console.error);
