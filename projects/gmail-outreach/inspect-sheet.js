const { google } = require('googleapis');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:Z1',  // Get all column headers
  });
  
  const headers = response.data.values[0];
  console.log('Column structure:');
  headers.forEach((h, i) => {
    console.log(`  ${String.fromCharCode(65 + i)}: ${h}`);
  });
  
  // Get first 5 data rows
  const dataResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A2:Z6',
  });
  
  console.log('\n--- Sample Data (rows 2-6) ---');
  if (dataResponse.data.values) {
    dataResponse.data.values.forEach((row, idx) => {
      console.log(`\nRow ${idx + 2}:`);
      row.forEach((cell, colIdx) => {
        if (cell) {
          console.log(`  ${headers[colIdx]}: ${cell}`);
        }
      });
    });
  }
}

inspectSheet().catch(console.error);
