const { google } = require('googleapis');
const path = require('path');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:N10',
  });
  
  res.data.values.forEach((row, i) => {
    console.log(`Row ${i}:`, JSON.stringify(row.slice(0, 10)));
  });
}

inspectSheet().catch(console.error);
