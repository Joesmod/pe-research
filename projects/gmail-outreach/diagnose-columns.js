const { google } = require('googleapis');
const path = require('path');

async function diagnose() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:Z10'
  });
  
  const rows = response.data.values || [];
  
  console.log('First 10 rows, all columns:');
  console.log('='.repeat(80));
  
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    console.log(`\nRow ${i + 1}:`);
    const row = rows[i];
    for (let j = 0; j < row.length; j++) {
      const colLetter = String.fromCharCode(65 + j); // A, B, C, D...
      console.log(`  ${colLetter}: ${row[j] || '(empty)'}`);
    }
  }
}

diagnose().catch(console.error);
