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

  // Get sheet metadata
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  console.log('\n📋 Available sheets/tabs:\n');
  metadata.data.sheets.forEach(sheet => {
    console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
  });

  // Read first row to check structure
  console.log('\n📊 Checking "Outreach Tracker" tab:\n');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Outreach Tracker!A1:Z1',
  });

  console.log('Headers:', response.data.values[0]);
}

main().catch(console.error);
