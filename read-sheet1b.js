const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A200:K250'
  });
  if (r.data.values) r.data.values.forEach((row, i) => console.log((i+200) + '|' + row.join('|')));
  else console.log('No more rows');
})();
