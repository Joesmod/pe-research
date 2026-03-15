const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_KEY = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Check specific rows for Bow River
  const rowsToCheck = [947, 948, 952, 955];
  
  for (const rowNum of rowsToCheck) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${rowNum}:N${rowNum}`,
    });

    console.log(`\nRow ${rowNum}:`, response.data.values[0]);
  }

  // Also check Audax (row 2)
  const audaxResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:N2',
  });
  console.log('\nRow 2 (Audax):', audaxResponse.data.values[0]);
}

main().catch(console.error);
