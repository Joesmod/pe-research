const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:O';

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  return response.data.values;
}

async function main() {
  const rows = await getSheetData();
  
  console.log('Headers:');
  console.log(rows[0]);
  console.log('\nFirst 10 data rows:');
  
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    console.log(`  Company: ${row[0] || '(empty)'}`);
    console.log(`  Contact: ${row[2] || '(empty)'}`);
    console.log(`  Email: ${row[3] || '(empty)'}`);
    console.log(`  Status: ${row[6] || '(empty)'}`);
  }
  
  // Count status types
  const statuses = {};
  for (let i = 1; i < rows.length; i++) {
    const status = (rows[i][6] || '').trim();
    statuses[status] = (statuses[status] || 0) + 1;
  }
  
  console.log('\n\nStatus breakdown:');
  Object.entries(statuses).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`  ${status || '(empty)'}: ${count}`);
  });
}

main().catch(console.error);
