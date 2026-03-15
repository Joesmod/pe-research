const { google } = require('googleapis');

async function checkRows() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A220:N225'
  });
  
  res.data.values.forEach((row, i) => {
    console.log('Row', 220 + i, ':', JSON.stringify(row));
  });
}

checkRows().catch(console.error);
