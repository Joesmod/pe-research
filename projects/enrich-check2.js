const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M200'
  });
  const rows = r.data.values;
  // Show all rows with status "Researched" or empty status
  console.log('--- STATUS: Researched or Empty ---');
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = row[8] || '';
    if (status === 'Researched' || status === '') {
      console.log('Row ' + (i+1) + ': ' + (row[0]||'') + ' | Contact: ' + (row[1]||'EMPTY') + ' | Email: ' + (row[3]||'EMPTY') + ' | Status: ' + (status||'EMPTY') + ' | Score: ' + (row[12]||''));
    }
  }
})();
