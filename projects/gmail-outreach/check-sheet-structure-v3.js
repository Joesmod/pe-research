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
    range: 'Sheet1!A1:Z220',
  });

  const rows = response.data.values;
  console.log('📊 Headers (Row 1):');
  console.log(rows[0]);
  console.log('\n');

  console.log('📝 Sample rows with issues:');
  console.log('\nRow 208:');
  console.log(rows[207]);
  console.log('\nRow 220:');
  console.log(rows[219]);
  console.log('\nRow 763:');
  if (rows[762]) console.log(rows[762]);
}

main().catch(console.error);
