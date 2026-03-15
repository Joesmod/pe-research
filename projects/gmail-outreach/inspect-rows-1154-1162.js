const { google } = require('googleapis');

async function inspectRows() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get rows 1154-1162
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1154:N1162',
  });
  
  const rows = response.data.values;
  
  rows.forEach((row, idx) => {
    const rowNum = 1154 + idx;
    console.log(`\n=== ROW ${rowNum} ===`);
    row.forEach((cell, colIdx) => {
      const col = String.fromCharCode(65 + colIdx);
      console.log(`  ${col}: ${cell || '(empty)'}`);
    });
  });
}

inspectRows().catch(console.error);
