const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:L'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0] || [];
  
  // Find column indices
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  console.log('Column indices:', { companyIdx, contactIdx, emailIdx, statusIdx });
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if already enriched or dead
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase() === 'enriched') {
      continue;
    }
    
    // Needs enrichment if:
    // 1. Empty contact name, OR
    // 2. Generic/info email (info@, sales@, ir@, contact@, admin@, support@), OR
    // 3. Empty email
    const hasGenericEmail = email && (
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      email.startsWith('admin@') ||
      email.startsWith('support@')
    );
    
    if (!contact.trim() || !email.trim() || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: !contact.trim() ? 'No contact' : (!email.trim() ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log('\n=== Leads Needing Enrichment ===');
  console.log(`Total: ${needsEnrichment.length}\n`);
  
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Status: ${lead.status || '(empty)'}`);
    console.log(`  Reason: ${lead.reason}`);
    console.log('');
  });
  
  console.log(`\nShowing first 15 of ${needsEnrichment.length} total`);
})();
