const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const keyFile = 'service-account.json';

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:I10',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('First 10 rows of the sheet:\n');
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`);
    row.forEach((cell, j) => {
      console.log(`  Col ${j}: ${cell}`);
    });
    console.log('');
  });
}

inspectSheet().catch(console.error);
