const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'projects/gmail-outreach/service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

(async()=>{
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const r = await sheets.spreadsheets.values.get({spreadsheetId:'11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4', range:'Sheet1!A1:L200'});
  const rows = r.data.values;
  const needs = rows.slice(1).filter((row) => {
    const email = (row[3]||'').toLowerCase();
    const name = row[1]||'';
    return !email || email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@') || !name;
  });
  needs.forEach(row => console.log(row[0] + ' | ' + (row[1]||'EMPTY') + ' | ' + (row[3]||'EMPTY') + ' | Status:' + (row[8]||'')));
  console.log('---TOTAL: ' + needs.length);
})();
