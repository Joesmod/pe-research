const { google } = require('googleapis');

async function scanForEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const header = rows[0];
  console.log('Sheet columns:', header.join(' | '));
  console.log('');
  
  const needsEnrichment = [];
  
  // Scan rows 2 onwards
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip if company is empty
    if (!company.trim()) continue;
    
    // Check if needs enrichment
    const hasNoContact = !contact.trim();
    const hasGenericEmail = email.match(/^(info@|sales@|ir@|contact@|general@|admin@)/i);
    const hasNoEmail = !email.trim();
    const needsEmail = status.toLowerCase().includes('needs email') || 
                       status.toLowerCase().includes('partial');
    
    if (hasNoContact || hasGenericEmail || hasNoEmail || needsEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        status,
        reason: hasNoContact ? 'No Contact Name' : 
                hasGenericEmail ? 'Generic Email' : 
                hasNoEmail ? 'No Email' : 
                'Status Needs Email'
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT NEEDED: ${needsEnrichment.length} LEADS ===\n`);
  
  needsEnrichment.slice(0, 20).forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  Contact: ${item.contact || '(EMPTY)'}`);
    console.log(`  Title: ${item.title || '(EMPTY)'}`);
    console.log(`  Email: ${item.email || '(EMPTY)'}`);
    console.log(`  Reason: ${item.reason}`);
    console.log('');
  });
  
  if (needsEnrichment.length > 20) {
    console.log(`... and ${needsEnrichment.length - 20} more.\n`);
  }
  
  // Save to JSON
  const fs = require('fs');
  fs.writeFileSync('enrichment-needs-march15-907pm.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-needs-march15-907pm.json`);
}

scanForEnrichmentNeeds().catch(console.error);
