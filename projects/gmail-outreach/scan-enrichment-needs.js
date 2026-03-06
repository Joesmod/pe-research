const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });

  const rows = res.data.values;
  const header = rows[0];
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.trim() === '';
    
    // Skip if already enriched or dead leads
    if (status && (status.includes('Dead') || status === 'Enriched')) {
      continue;
    }
    
    // Prioritize "New - Unresearched" and "Partial"
    const isPriority = status && (status.includes('New - Unresearched') || status.includes('Partial'));
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        firmName,
        website,
        contactName,
        email,
        status,
        isPriority,
        reason: hasNoContact ? 'No contact name' : 'Generic/missing email'
      });
    }
  }
  
  // Sort by priority (priority status, then no name at all, then generic email)
  needsEnrichment.sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    if (!a.contactName && b.contactName) return -1;
    if (a.contactName && !b.contactName) return 1;
    return 0;
  });
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('Top 15 targets:');
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`\nRow ${lead.row}: ${lead.firmName}`);
    console.log(`  Website: ${lead.website}`);
    console.log(`  Current Contact: ${lead.contactName || 'NONE'}`);
    console.log(`  Current Email: ${lead.email || 'NONE'}`);
    console.log(`  Reason: ${lead.reason}`);
  });
  
  fs.writeFileSync('enrichment-targets-march5-midnight.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
})();
