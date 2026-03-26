const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  // Get all of Sheet1 to find firms without contacts
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:K200'
  });
  r.data.values.forEach((row, i) => console.log((i+1) + '|' + row.join('|')));
})();
