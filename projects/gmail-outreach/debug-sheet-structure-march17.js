const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function readSheet() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:N10',
  });
  
  return response.data.values || [];
}

async function main() {
  const rows = await readSheet();
  
  console.log('First 10 rows of the sheet:\n');
  
  rows.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`);
    console.log(`  A (Company): ${row[0] || '(empty)'}`);
    console.log(`  C (Contact): ${row[2] || '(empty)'}`);
    console.log(`  D (Title): ${row[3] || '(empty)'}`);
    console.log(`  E (Email): ${row[4] || '(empty)'}`);
    console.log(`  J (Status): ${row[9] || '(empty)'}`);
    console.log('');
  });
}

main().catch(console.error);
