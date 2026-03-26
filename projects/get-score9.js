const path = require('path');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});

(async () => {
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A:H'
  });
  const rows = r.data.values || [];
  // Find actual row indices
  const s9 = [];
  rows.forEach((row, i) => {
    if (i === 0) return;
    if (parseInt(row[1]) === 9 && (!row[7] || row[7].trim().length < 10)) {
      s9.push({ row: i + 1, co: row[0], name: row[2], title: row[3], li: row[6] || '' });
    }
  });
  console.log(JSON.stringify(s9));
})();
