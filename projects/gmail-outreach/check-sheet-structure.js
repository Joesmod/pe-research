const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A1:M5', // First 5 rows
  });

  const rows = response.data.values || [];
  
  console.log('=== SHEET STRUCTURE ===\n');
  console.log('Headers (Row 1):');
  rows[0].forEach((header, i) => {
    console.log(`  Col ${String.fromCharCode(65 + i)} (${i}): ${header}`);
  });
  
  console.log('\n=== First 3 Data Rows ===');
  for (let i = 1; i < Math.min(4, rows.length); i++) {
    console.log(`\nRow ${i + 1}:`);
    rows[i].forEach((cell, j) => {
      if (cell) console.log(`  ${rows[0][j]}: ${cell}`);
    });
  }

  // Also search for one of our target firms
  console.log('\n=== Searching for "NewSpring Capital" ===');
  const searchResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:A', // All firm names
  });
  
  const firmColumn = searchResponse.data.values || [];
  for (let i = 0; i < firmColumn.length; i++) {
    if (firmColumn[i][0] && firmColumn[i][0].toLowerCase().includes('newspring')) {
      console.log(`Found at row ${i + 1}: ${firmColumn[i][0]}`);
    }
  }
}

main().catch(console.error);
