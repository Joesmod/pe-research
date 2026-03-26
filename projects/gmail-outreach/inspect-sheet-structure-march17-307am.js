const { google } = require('googleapis');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:O20',
  });

  const rows = response.data.values || [];
  
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`, JSON.stringify(row.slice(0, 8)));
  });
}

inspectSheet().catch(console.error);
