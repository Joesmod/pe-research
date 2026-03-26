const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  // Check contacts sheet for PSG Equity, THL, Vance Street, Valeas
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A1:L5'
  });
  console.log('Contacts headers:', JSON.stringify(r.data.values[0]));
  
  const r2 = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A1:L500'
  });
  const rows = r2.data.values;
  const targets = ['PSG', 'Thomas H. Lee', 'Vance Street', 'Valeas'];
  for (let i = 1; i < rows.length; i++) {
    const company = (rows[i][0] || '').toLowerCase();
    if (targets.some(t => company.includes(t.toLowerCase()))) {
      console.log('Row ' + (i+1) + ': ' + JSON.stringify(rows[i]));
    }
  }
  console.log('\nTotal contacts:', rows.length - 1);
})();
