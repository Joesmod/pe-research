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
    range: 'Sheet1!A1:H300',
  });
  
  const rows = res.data.values;
  const targets = ['Gridiron', 'Yellowstone', 'Riverside', 'MLG Capital', 'NewView', 'Nexa Equity', 'Noble Investment', 'Pearl Energy', 'Pharos Capital', '26North', 'K1 Investment', 'Mainsail Partners'];
  
  rows.forEach((row, i) => {
    const company = row[0] || '';
    if (targets.some(t => company.includes(t))) {
      console.log(`Row ${i + 1}: ${company} | Contact: ${row[2] || 'EMPTY'} | Email: ${row[4] || 'EMPTY'} | Status: ${row[6] || 'EMPTY'}`);
    }
  });
})();
