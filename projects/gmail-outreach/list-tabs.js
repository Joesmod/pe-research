const {google} = require('googleapis');
(async () => {
  const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const meta = await sheets.spreadsheets.get({spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'});
  meta.data.sheets.forEach(s => console.log(s.properties.title));
})();
