const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Reading full sheet data...\n');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:K20', // First 20 rows to inspect structure
    });

    const rows = response.data.values || [];
    
    console.log(`Retrieved ${rows.length} rows\n`);
    console.log('=== Sheet Structure ===\n');
    
    rows.forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`);
      row.forEach((cell, cellIdx) => {
        const colLetter = String.fromCharCode(65 + cellIdx);
        console.log(`  ${colLetter}: ${cell || '(empty)'}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
