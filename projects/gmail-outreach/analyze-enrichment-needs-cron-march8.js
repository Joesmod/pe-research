const { google } = require('googleapis');

async function analyzeEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const header = rows[0];
  const dataRows = rows.slice(1);
  
  const needsEnrichment = [];
  
  dataRows.forEach((row, index) => {
    const rowNum = index + 2; // +2 because: 1 for header, 1 for 0-indexed
    const company = row[0] || '';
    const notebookLM = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const status = row[9] || '';
    
    // Skip if Dead or already has good contact
    if (status.includes('Dead') || status.includes('Not a PE')) {
      return;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || 
                           email.includes('info@') || 
                           email.includes('sales@') || 
                           email.includes('ir@') ||
                           email.includes('contact@') ||
                           email.trim() === '';
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        row: rowNum,
        company,
        website,
        notebookLM,
        contactName,
        email,
        status,
        issue: hasNoContact ? 'No Contact Name' : 'Generic/Missing Email'
      });
    }
  });
  
  console.log(`\n=== ENRICHMENT ANALYSIS ===`);
  console.log(`Total rows analyzed: ${dataRows.length}`);
  console.log(`Rows needing enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 15-20 that need enrichment
  const toShow = needsEnrichment.slice(0, 20);
  toShow.forEach(item => {
    console.log(`\nRow ${item.row}: ${item.company}`);
    console.log(`  Website: ${item.website || item.notebookLM || 'NONE'}`);
    console.log(`  Current Contact: ${item.contactName || 'NONE'}`);
    console.log(`  Current Email: ${item.email || 'NONE'}`);
    console.log(`  Issue: ${item.issue}`);
    console.log(`  Status: ${item.status}`);
  });
  
  return needsEnrichment;
}

analyzeEnrichmentNeeds().catch(console.error);
