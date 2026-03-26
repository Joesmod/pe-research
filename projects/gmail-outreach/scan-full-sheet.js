const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:I',
  });
  
  const rows = response.data.values || [];
  
  console.log('🔍 Scanning entire sheet for enrichment needs...\n');
  
  const needsEnrichment = [];
  
  // NO HEADER ROW - start at index 0
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    // Skip dead/not PE
    if (status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe')) {
      continue;
    }
    
    // Check for enrichment needs
    const noContact = !contactName;
    const noEmail = !email;
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    const needsEmail = status.toLowerCase().includes('needs email');
    const inferred = (status + (row[8] || '')).toLowerCase().includes('inferred');
    
    const needs = (noContact || noEmail || hasGenericEmail || needsEmail || inferred) && 
                   !status.toLowerCase().includes('enriched') && 
                   company;
    
    if (needs) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status,
        reason: noContact ? 'No contact' : 
                noEmail ? 'No email' : 
                hasGenericEmail ? `Generic: ${email}` : 
                needsEmail ? 'Status: Needs Email' :
                inferred ? 'Inferred email pattern' : 'Unknown'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment:\n`);
  
  needsEnrichment.slice(0, 20).forEach(item => {
    console.log(`Row ${item.rowIndex}: ${item.company}`);
    console.log(`  Website: ${item.website || '[NONE]'}`);
    console.log(`  Contact: ${item.contactName || '[NONE]'}`);
    console.log(`  Email: ${item.email || '[NONE]'}`);
    console.log(`  Status: ${item.status || '[NONE]'}`);
    console.log(`  Reason: ${item.reason}`);
    console.log('');
  });
  
  if (needsEnrichment.length > 20) {
    console.log(`... and ${needsEnrichment.length - 20} more\n`);
  }
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('needs-enrichment-full.json', JSON.stringify(needsEnrichment, null, 2));
  console.log('✓ Saved full list to needs-enrichment-full.json');
}

main().catch(console.error);
