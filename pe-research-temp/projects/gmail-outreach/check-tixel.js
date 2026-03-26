const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: './service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
(async () => {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  const all = await sheets.spreadsheets.values.get({spreadsheetId:id, range:'Sheet1!A:M'});
  const rows = all.data.values || [];
  const headers = rows[0];
  rows.forEach((r,i) => {
    if (r[0] && r[0].toLowerCase().includes('tixel')) {
      console.log('Row', i+1, ':');
      headers.forEach((h,j) => { if(r[j]) console.log(`  ${h}: ${r[j]}`); });
    }
  });
})().catch(e => console.error(e.message));
