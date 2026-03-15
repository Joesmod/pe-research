const { google } = require('googleapis');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  
  console.log('=== HEADER ROW ===');
  console.log(rows[0]);
  console.log('\n=== SAMPLE ROWS (first 5 active) ===');
  
  let count = 0;
  for (let i = 1; i < rows.length && count < 5; i++) {
    if (rows[i][6] !== 'Dead' && rows[i][6] !== 'Bounced') {
      console.log(`\nRow ${i + 1}:`);
      rows[i].forEach((cell, idx) => {
        console.log(`  Col ${String.fromCharCode(65 + idx)} (${idx}): ${cell || '(empty)'}`);
      });
      count++;
    }
  }
}

readSheet().catch(console.error);
