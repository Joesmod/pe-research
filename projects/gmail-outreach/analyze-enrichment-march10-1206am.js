const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers.join(' | '));
  console.log('\n=== Analyzing for enrichment needs ===\n');
  
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[5] || '';
    
    // Skip if already Dead/Closed
    if (status && (status.toLowerCase().includes('dead') || status.toLowerCase().includes('closed'))) {
      continue;
    }
    
    // Check if needs enrichment:
    // 1. No contact name OR
    // 2. Email is empty or generic (info@, sales@, ir@, contact@)
    const hasGenericEmail = email && (
      email.startsWith('info@') ||
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('support@')
    );
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company: company,
        contactName: contactName,
        email: email,
        status: status
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment:\n`);
  
  // Show first 15
  const toShow = needsEnrichment.slice(0, 15);
  toShow.forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contactName || '[EMPTY]'}`);
    console.log(`  Email: ${lead.email || '[EMPTY]'}`);
    console.log(`  Status: ${lead.status || '[EMPTY]'}`);
    console.log('');
  });
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
  console.log(`Showing first 15 for enrichment this run.`);
  
})().catch(console.error);
