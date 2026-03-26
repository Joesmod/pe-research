const path = require('path');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const c = require(path.join(dir, 'service-account.json'));
const a = new JWT({email: c.client_email, key: c.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const s = google.sheets({version:'v4', auth: a});
(async () => {
  const r = await s.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!H1:H90'
  });
  const v = r.data.values || [];
  const filled = v.filter((r, i) => i > 0 && r[0] && r[0].length > 10);
  console.log('Filled H col:', filled.length, '/ 87');
  filled.slice(0, 5).forEach(r => console.log(r[0].slice(0, 120)));
  const noData = v.filter((r, i) => i > 0 && r[0] && r[0].includes('No'));
  console.log('No data entries:', noData.length);
})();
