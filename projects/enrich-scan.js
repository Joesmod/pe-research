const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M300'
  });
  const rows = res.data.values || [];
  console.log('Total rows:', rows.length);
  console.log('Headers:', JSON.stringify(rows[0]));
  
  for(let i=1; i<rows.length; i++) {
    const r = rows[i];
    const company = r[0] || '';
    const name = r[1] || '';
    const email = r[3] || '';
    const status = (r[8] || '').trim();
    const generic = /^(info|sales|ir|contact|general|hello|office|inquiries)@/i;
    const needsEnrich = !name || !email || generic.test(email) || status === '' || status === 'New' || status === 'Needs Enrichment';
    if(needsEnrich) {
      console.log(`Row ${i+1}: ${company} | Name: "${name}" | Email: "${email}" | Status: "${status}"`);
    }
  }
})();
