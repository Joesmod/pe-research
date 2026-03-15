const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:L';
const searchFirms = ['CIVC', 'Wind Point', 'BV Investment', 'Oak HC/FT', 'Gridiron'];

async function findRows() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  const rows = response.data.values;
  
  console.log('Searching for firms...\n');
  for (let i = 1; i < rows.length; i++) {
    const firm = (rows[i][0] || '');
    for (const search of searchFirms) {
      if (firm.toLowerCase().includes(search.toLowerCase())) {
        console.log(`Row ${i + 1}: ${firm}`);
      }
    }
  }
}

findRows().catch(console.error);
