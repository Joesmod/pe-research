const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:K20',
  });

  const rows = response.data.values || [];
  
  console.log('First 20 rows of Sheet1:\n');
  rows.forEach((row, idx) => {
    console.log(`Row ${idx}:`, JSON.stringify(row));
  });

  console.log('\n\nChecking rows around 1086:\n');
  
  const response2 = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1084:K1095',
  });

  const rows2 = response2.data.values || [];
  rows2.forEach((row, idx) => {
    console.log(`Row ${1084 + idx}:`, JSON.stringify(row));
  });
}

main().catch(console.error);
