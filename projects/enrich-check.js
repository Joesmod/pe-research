const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M300'
  });
  const rows = r.data.values;
  console.log('Header:', rows[0].join(' | '));
  console.log('---');
  let needsWork = [];
  rows.slice(1).forEach((row, i) => {
    const status = row[8] || '';
    const email = row[3] || '';
    const contact = row[1] || '';
    const company = row[0] || '';
    const isGeneric = email.includes('info@') || email.includes('sales@') || email.includes('ir@');
    if (!contact || !email || isGeneric || status !== 'Enriched') {
      needsWork.push({row: i + 2, company, contact, email, status});
    }
  });
  needsWork.forEach(r => {
    console.log('Row ' + r.row + ': ' + r.company + ' | Contact: ' + (r.contact || 'EMPTY') + ' | Email: ' + (r.email || 'EMPTY') + ' | Status: ' + (r.status || 'EMPTY'));
  });
  console.log('---');
  console.log('Total rows:', rows.length, '| Needs work:', needsWork.length);
})();
