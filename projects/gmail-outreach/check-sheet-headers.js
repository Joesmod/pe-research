const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1',
  });

  const headers = response.data.values[0];
  console.log('📋 Sheet headers:');
  headers.forEach((header, idx) => {
    console.log(`  Column ${String.fromCharCode(65 + idx)}: "${header}"`);
  });

  console.log(`\n✅ Total columns: ${headers.length}`);
}

main().catch(console.error);
