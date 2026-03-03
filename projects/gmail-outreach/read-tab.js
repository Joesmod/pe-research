const {google} = require('googleapis');
const tab = process.argv[2] || 'Tracker';
const rows = process.argv[3] || '20';
(async () => {
  const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: `'${tab}'!A1:Z${rows}`
  });
  (res.data.values || []).forEach((r,i) => console.log(`Row ${i+1}: ${JSON.stringify(r)}`));
})();
