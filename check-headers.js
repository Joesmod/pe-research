const { google } = require('googleapis');
const key = require('../gmail-outreach/service-account.json');

(async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:J5',
  });
  
  console.log('=== HEADERS AND FIRST FEW ROWS ===\n');
  res.data.values.forEach((row, i) => {
    console.log(`Row ${i + 1}:`);
    row.forEach((cell, j) => {
      const colLetter = String.fromCharCode(65 + j);
      console.log(`  ${colLetter}: ${cell}`);
    });
    console.log('');
  });
})();
