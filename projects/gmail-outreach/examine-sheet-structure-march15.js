const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get all sheets
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });
    
    console.log('Available sheets:');
    meta.data.sheets.forEach((sheet, idx) => {
      console.log(`  ${idx + 1}. ${sheet.properties.title} (${sheet.properties.sheetId})`);
    });
    
    // Read first sheet
    console.log('\nReading first 10 rows of first sheet...\n');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A1:O10'
    });
    
    const rows = response.data.values || [];
    
    rows.forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`);
      row.forEach((cell, cellIdx) => {
        const colLetter = String.fromCharCode(65 + cellIdx);
        console.log(`  ${colLetter}: ${cell}`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
