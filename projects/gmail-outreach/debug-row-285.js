const { google } = require('googleapis');

async function debugRow() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read header
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:P1'
  });
  const header = headerRes.data.values[0];
  
  // Read row 285
  const rowRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A285:P285'
  });
  const row = rowRes.data.values[0];
  
  console.log('\n=== ROW 285 DEBUG ===\n');
  console.log('Header columns:', header.length);
  console.log('Row columns:', row.length);
  console.log('');
  
  for (let i = 0; i < Math.max(header.length, row.length); i++) {
    const colLetter = String.fromCharCode(65 + i);
    console.log(`${colLetter} | ${header[i] || '(no header)'} | ${row[i] || '(empty)'}`);
  }
}

debugRow().catch(console.error);
