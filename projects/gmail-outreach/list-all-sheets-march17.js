const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function listSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.get({
    spreadsheetId: CRM_SHEET_ID,
  });
  
  console.log('All sheets in workbook:');
  res.data.sheets.forEach(sheet => {
    console.log(`  - ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
  });
  
  // Also check first 10 rows of Sheet1 to understand structure
  console.log('\n\nFirst 10 rows of Sheet1:');
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A1:O10',
  });
  
  const rows = data.data.values || [];
  rows.forEach((row, i) => {
    console.log(`\nRow ${i}:`);
    console.log(`  Company: ${row[0] || ''}`);
    console.log(`  Website: ${row[1] || ''}`);
    console.log(`  Contact: ${row[2] || ''}`);
    console.log(`  Title: ${row[3] || ''}`);
    console.log(`  Email: ${row[4] || ''}`);
    console.log(`  Col F: ${row[5] || ''}`);
    console.log(`  LinkedIn: ${row[6] || ''}`);
    console.log(`  Col H: ${row[7] || ''}`);
    console.log(`  Notes/Info: ${row[8] || ''}`);
    console.log(`  Status: ${row[9] || ''}`);
  });
}

listSheets().catch(console.error);
