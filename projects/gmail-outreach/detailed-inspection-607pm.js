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
  
  console.log('First row (likely headers):');
  rows[0].forEach((h, i) => console.log(`  ${String.fromCharCode(65 + i)} (${i}): ${h}`));
  
  console.log('\n\nSample data rows (2-5):');
  for (let i = 1; i <= 4 && i < rows.length; i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    row.forEach((val, idx) => {
      if (val) console.log(`  ${String.fromCharCode(65 + idx)}: ${val}`);
    });
  }
  
  // Find rows with status = '' and see what Contact/Email looks like
  console.log('\n\n=== ROWS WITH EMPTY STATUS ===');
  let count = 0;
  for (let i = 1; i < rows.length && count < 10; i++) {
    const row = rows[i];
    const status = (row[9] || '').trim(); // Column J (index 9)
    if (!status) {
      console.log(`\nRow ${i + 1}:`);
      console.log(`  Company (A): ${row[0] || '(empty)'}`);
      console.log(`  Contact (C): ${row[2] || '(empty)'}`);
      console.log(`  Email (E): ${row[4] || '(empty)'}`);
      console.log(`  Status (J): ${row[9] || '(empty)'}`);
      count++;
    }
  }
}

main().catch(console.error);
