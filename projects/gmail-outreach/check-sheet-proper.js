const { google } = require('googleapis');

async function checkSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:Z1',
  });
  
  const headers = response.data.values[0];
  console.log('=== ACTUAL COLUMN HEADERS ===\n');
  headers.forEach((header, index) => {
    const col = String.fromCharCode(65 + index);
    console.log(`${col}: ${header}`);
  });
  
  console.log('\n=== FIRST 5 DATA ROWS ===\n');
  const dataResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A2:Z6',
  });
  
  const rows = dataResponse.data.values;
  rows.forEach((row, idx) => {
    console.log(`\n--- Row ${idx + 2} ---`);
    row.forEach((cell, colIdx) => {
      const col = String.fromCharCode(65 + colIdx);
      const header = headers[colIdx] || `Col${col}`;
      console.log(`  ${header}: ${cell || '(empty)'}`);
    });
  });
}

checkSheet().catch(console.error);
