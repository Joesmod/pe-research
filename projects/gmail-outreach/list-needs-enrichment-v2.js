const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'A:L',
  });
  const rows = res.data.values || [];
  const headers = rows[0];
  
  console.log('FIRMS NEEDING ENRICHMENT:\n');
  let count = 0;
  
  for (let i = 1; i < rows.length && count < 20; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const email = row[3] || '';
    const status = row[10] || '';
    
    // Check if needs enrichment
    const needsEnrichment = (
      !contact || 
      !email ||
      email.includes('info@') || 
      email.includes('ir@') || 
      email.includes('sales@') ||
      email.includes('contact@') ||
      status.includes('Unresearched') ||
      status.includes('Partial')
    );
    
    if (needsEnrichment && company) {
      console.log(`Row ${i+1}: ${company}`);
      console.log(`  Website: ${website}`);
      console.log(`  Contact: ${contact || '(empty)'}`);
      console.log(`  Email: ${email || '(empty)'}`);
      console.log(`  Status: ${status || '(empty)'}`);
      console.log('');
      count++;
    }
  }
  
  console.log(`\nTotal found: ${count} firms needing enrichment`);
})().catch(console.error);
