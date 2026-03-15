const { google } = require('googleapis');

async function scanEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get all data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  console.log('=== HEADERS ===');
  headers.forEach((h, i) => console.log(`${String.fromCharCode(65+i)}: ${h}`));
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const companyName = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip completely empty rows
    if (!companyName && !website) {
      continue;
    }
    
    // Skip if already marked as Enriched
    if (status.toLowerCase().includes('enriched')) {
      continue;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') ||
      email.includes('sales@') ||
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('admin@')
    );
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsEnrichment.push({
        row: rowNum,
        company: companyName,
        website,
        contactName,
        title,
        email,
        status,
        reason: hasNoContact ? 'No contact name' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT NEEDED: ${needsEnrichment.length} leads ===\n`);
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  Current contact: ${lead.contactName || '(empty)'}`);
    console.log(`  Current email: ${lead.email || '(empty)'}`);
    console.log(`  Reason: ${lead.reason}`);
    console.log('');
  });
  
  return needsEnrichment;
}

scanEnrichmentNeeds()
  .then(leads => {
    console.log(`\n✅ Found ${leads.length} leads needing enrichment`);
    console.log(`Processing first 15 for this run.`);
  })
  .catch(console.error);
