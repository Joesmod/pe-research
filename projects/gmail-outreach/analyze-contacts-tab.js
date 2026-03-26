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

  console.log('\n📊 Checking "Contacts" tab headers:\n');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A1:Z1',
  });

  console.log('Headers:', response.data.values[0]);

  console.log('\n📊 First 10 rows of data:\n');
  const dataResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A1:Z15',
  });

  dataResponse.data.values.forEach((row, idx) => {
    console.log(`\nRow ${idx + 1}:`, row.slice(0, 10)); // First 10 columns
  });

  // Count rows
  const allData = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:A',
  });
  console.log(`\n📋 Total rows in Contacts tab: ${allData.data.values.length}`);
}

main().catch(console.error);
