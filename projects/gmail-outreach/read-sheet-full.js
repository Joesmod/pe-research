const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:Z200'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Total columns:', headers.length);
  console.log('\nHeaders:');
  headers.forEach((h, i) => console.log(`  [${i}] ${h}`));
  
  // Find column indexes
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const titleIdx = headers.indexOf('Title');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  console.log('\n\nLeads needing enrichment (empty Contact Name or generic Email):');
  console.log('='.repeat(140));
  
  let count = 0;
  for (let i = 1; i < Math.min(rows.length, 200); i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if no company
    if (!company.trim()) continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    
    const needsEnrichment = !contact.trim() || !email.trim() || hasGenericEmail;
    
    if (needsEnrichment && count < 20) {
      console.log(`\nRow ${i+1}: ${company}`);
      console.log(`  Contact: '${contact}'`);
      console.log(`  Title: '${title}'`);
      console.log(`  Email: '${email}'`);
      console.log(`  Status: '${status}'`);
      count++;
    }
  }
  
  console.log(`\n\nTotal needing enrichment: ${count}+`);
})();
