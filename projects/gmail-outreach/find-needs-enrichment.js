const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    
    if (!firmName) continue;
    if (status && status.includes('Dead')) continue;
    if (status && status.includes('Not PE')) continue;
    
    // Check if needs enrichment
    if (!contactName || !email || (email && (email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@'))) || (status && status.includes('Needs Email'))) {
      needsEnrichment.push({ 
        row: i+1, 
        firmName, 
        contactName: contactName || '(empty)', 
        email: email || '(empty)', 
        status: status || '(empty)' 
      });
    }
  }
  
  console.log('Firms needing enrichment (' + needsEnrichment.length + ' total):\n');
  needsEnrichment.slice(0, 15).forEach(f => {
    console.log(`${f.firmName} | ${f.contactName} | ${f.email} | ${f.status}`);
  });
})();
