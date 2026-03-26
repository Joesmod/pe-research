const { google } = require('googleapis');
const path = require('path');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:N10'
  });
  
  const rows = res.data.values || [];
  
  console.log('First 10 rows:\n');
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`);
    row.slice(0, 14).forEach((cell, j) => {
      const col = String.fromCharCode(65 + j);
      console.log(`  [${col}] ${cell || '(empty)'}`);
    });
    console.log('');
  });
})();
