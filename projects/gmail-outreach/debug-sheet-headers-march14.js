const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:O10',
  });

  const rows = result.data.values || [];
  
  console.log('First 10 rows:');
  rows.forEach((row, i) => {
    console.log(`\nRow ${i + 1}:`);
    row.forEach((cell, j) => {
      console.log(`  Col ${String.fromCharCode(65 + j)}: ${cell}`);
    });
  });
}

main().catch(console.error);
