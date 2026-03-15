const { google } = require('googleapis');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function findObra() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
  });
  const rows = response.data.values;
  rows.forEach((row, index) => {
    if (row[0] && row[0].toLowerCase().includes('obra')) {
      console.log(`Row ${index + 1}: ${row[0]} | Status: ${row[1]} | Contact: ${row[2]} | Email: ${row[4]}`);
    }
  });
}
findObra().catch(console.error);
