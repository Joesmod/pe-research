const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  console.log('Headers:', rows[0]);
  console.log('\nTotal rows:', rows.length);
  console.log('\nFirst 5 data rows:');
  for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
    console.log(`\nRow ${i}:`, rows[i]);
  }

  // Save to file for inspection
  fs.writeFileSync('sheet-debug-march6-306am.json', JSON.stringify(rows, null, 2));
  console.log('\n\nFull data saved to sheet-debug-march6-306am.json');
}

main().catch(console.error);
