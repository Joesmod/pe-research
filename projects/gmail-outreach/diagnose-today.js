const { google } = require('googleapis');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N15'
  });

  console.log('=== FIRST 15 ROWS ===\n');
  response.data.values.forEach((row, i) => {
    console.log(`Row ${i + 1}:`, JSON.stringify(row));
  });
}

run().catch(console.error);
