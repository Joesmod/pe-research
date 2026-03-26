const { google } = require('googleapis');

async function checkHeaders() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:Z1',
  });
  
  const headers = result.data.values[0] || [];
  console.log('Headers with indices:');
  headers.forEach((header, index) => {
    console.log(`${index}: "${header}"`);
  });
}

checkHeaders().catch(console.error);
