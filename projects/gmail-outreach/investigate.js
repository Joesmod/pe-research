const { google } = require('googleapis');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A631:N650',
  });
  
  const rows = response.data.values;
  
  console.log('Rows 631-650 full data:\n');
  rows.forEach((row, i) => {
    console.log(`Row ${631 + i}:`);
    row.forEach((val, j) => {
      console.log(`  [${j}]: ${val || '(empty)'}`);
    });
    console.log('');
  });
}

run().catch(console.error);
