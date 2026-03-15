// Inspect sheet structure
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1',
  });

  const headers = response.data.values ? response.data.values[0] : [];
  console.log('\n=== Sheet Headers ===\n');
  headers.forEach((h, i) => {
    const col = String.fromCharCode(65 + i);
    console.log(`${col}: ${h}`);
  });

  // Also get first 3 data rows
  const dataResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:Z4',
  });

  console.log('\n=== First 3 Data Rows ===\n');
  const dataRows = dataResponse.data.values || [];
  dataRows.forEach((row, idx) => {
    console.log(`\nRow ${idx + 2}:`);
    row.forEach((val, i) => {
      const col = String.fromCharCode(65 + i);
      console.log(`  ${col} (${headers[i] || 'unknown'}): ${val}`);
    });
  });
}

inspectSheet().catch(console.error);
