const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:L10',
  });

  const rows = response.data.values;
  
  console.log('\n📋 First 10 rows of the sheet:\n');
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`);
    console.log(`  A: ${row[0] || '[empty]'}`);
    console.log(`  B: ${row[1] || '[empty]'}`);
    console.log(`  C: ${row[2] || '[empty]'}`);
    console.log(`  D: ${row[3] || '[empty]'}`);
    console.log(`  E: ${row[4] || '[empty]'}`);
    console.log('');
  });
}

main().catch(console.error);
