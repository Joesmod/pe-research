const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🔍 Inspecting Sheet Structure - March 16, 5:37 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get sheet metadata
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  
  console.log('📋 Available sheets:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`  - ${sheet.properties.title} (${sheet.properties.sheetId})`);
  });
  
  // Read first 10 rows from Sheet1
  console.log('\n📊 First 10 rows of Sheet1:\n');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M10',
  });
  
  const rows = response.data.values || [];
  rows.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`);
    row.forEach((cell, cellIdx) => {
      const colLetter = String.fromCharCode(65 + cellIdx);
      console.log(`  ${colLetter}: ${cell || '(empty)'}`);
    });
    console.log('');
  });
}

main().catch(console.error);
