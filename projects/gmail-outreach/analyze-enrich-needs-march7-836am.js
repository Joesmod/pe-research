const { google } = require('googleapis');

async function analyzeSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',  // Extended to column N for Gumbo Score
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Find leads needing enrichment (empty Contact Name or generic emails)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already enriched or contacted
    if (status.toLowerCase().includes('enriched') || status.toLowerCase().includes('contacted')) {
      continue;
    }
    
    // Check if needs enrichment
    const hasEmptyContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('media@'));
    
    if (hasEmptyContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contactName,
        email,
        status,
        issue: hasEmptyContact ? 'Empty contact name' : 'Generic email'
      });
    }
  }
  
  console.log(`\nTotal rows: ${rows.length - 1}`);
  console.log(`Leads needing enrichment: ${needsEnrichment.length}\n`);
  
  console.log('First 15 that need enrichment:');
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`\n${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Contact: ${lead.contactName || 'EMPTY'}`);
    console.log(`   Email: ${lead.email || 'EMPTY'}`);
    console.log(`   Issue: ${lead.issue}`);
  });
  
  // Save full list
  require('fs').writeFileSync(
    'enrich-targets-march7-836am.json',
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log(`\nFull list saved to enrich-targets-march7-836am.json`);
}

analyzeSheet().catch(console.error);
