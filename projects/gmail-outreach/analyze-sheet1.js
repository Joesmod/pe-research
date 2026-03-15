const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M300'
  });
  
  const rows = res.data.values || [];
  
  console.log('HEADERS:', JSON.stringify(rows[0]));
  console.log('\n\nSample rows (first 10 data rows):');
  
  for (let i = 1; i < Math.min(11, rows.length); i++) {
    console.log(`\nRow ${i + 1}:`, JSON.stringify(rows[i]));
  }
  
  console.log('\n\n=== ANALYSIS ===');
  console.log('Total rows:', rows.length - 1);
  
  // Now find rows that genuinely need enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const notebookLM = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const sector = row[7] || '';
    const portfolio = row[8] || '';
    const status = row[9] || '';
    
    // Check if needs enrichment
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@') || email.includes('marketing@') || email.includes('admin@'));
    const noContact = !contact || contact.trim() === '';
    const noEmail = !email || email.trim() === '';
    
    if ((noContact || hasGenericEmail || noEmail) && status !== 'Dead' && status !== 'Sent' && company && company !== 'Company Name') {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        website,
        linkedin,
        status: status || 'Active'
      });
    }
  }
  
  console.log(`\n\nRows needing enrichment: ${needsEnrichment.length}`);
  console.log('\nFirst 15 firms needing enrichment:');
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
})();
