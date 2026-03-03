const {google} = require('googleapis');
const path = require('path');
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  
  // First get sheet names
  const meta = await sheets.spreadsheets.get({spreadsheetId: SHEET_ID});
  const sheetNames = meta.data.sheets.map(s => s.properties.title);
  console.log('Sheets:', sheetNames.join(', '));
  
  // Read first sheet
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: sheetNames[0] + '!A1:L200'
  });
  const rows = r.data.values || [];
  rows.forEach((row, i) => {
    console.log(`ROW${i}|${row.join('|')}`);
  });
}
main().catch(e => { console.error(e.message); process.exit(1); });
