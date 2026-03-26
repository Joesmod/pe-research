const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));

async function inspectSheet() {
  const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read first 10 rows to understand structure
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M10'
  });

  const rows = response.data.values;
  
  console.log('First 10 rows:\n');
  rows.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`, JSON.stringify(row));
  });

  // Also check what sheets exist
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID
  });

  console.log('\n\nAvailable sheets:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`- ${sheet.properties.title} (${sheet.properties.sheetId})`);
  });
}

inspectSheet().catch(console.error);
