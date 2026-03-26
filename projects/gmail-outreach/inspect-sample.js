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
    range: 'Sheet1!A1:N20',  // First 20 rows
  });

  const rows = response.data.values;
  
  console.log('\n📋 First 20 rows of the sheet:\n');
  rows.forEach((row, idx) => {
    console.log(`\nRow ${idx + 1}:`);
    console.log(`  A (Company): ${row[0] || 'EMPTY'}`);
    console.log(`  C (Contact): ${row[2] || 'EMPTY'}`);
    console.log(`  D (Title): ${row[3] || 'EMPTY'}`);
    console.log(`  E (Email): ${row[4] || 'EMPTY'}`);
    console.log(`  J (Status): ${row[9] || 'EMPTY'}`);
  });
}

main().catch(console.error);
