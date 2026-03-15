const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M200'
  });
  
  const rows = res.data.values || [];
  
  // Print headers first
  console.log('HEADERS:');
  console.log(JSON.stringify(rows[0], null, 2));
  console.log('\n\nDATA ROWS:');
  
  // Find rows that need enrichment (empty contact or generic email)
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[1] || '';
    const title = row[2] || '';
    const email = row[3] || '';
    const status = row[7] || '';
    
    // Check if needs enrichment
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    const needsContact = !contact || contact.trim() === '';
    
    if ((needsContact || hasGenericEmail || !email) && status !== 'Dead' && company) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        status
      });
    }
  }
  
  console.log(JSON.stringify(needsEnrichment.slice(0, 20), null, 2));
  console.log(`\n\nTotal rows needing enrichment: ${needsEnrichment.length}`);
})();
