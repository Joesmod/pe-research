const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:N5',
  });

  const rows = response.data.values;
  
  rows.forEach((row, idx) => {
    console.log(`\nRow ${idx + 1}:`);
    row.forEach((cell, cellIdx) => {
      console.log(`  Col ${String.fromCharCode(65 + cellIdx)} (${cellIdx}): "${cell}"`);
    });
  });
}

main().catch(console.error);
