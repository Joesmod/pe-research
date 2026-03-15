const {google} = require('googleapis');
const fs = require('fs');

async function analyzeEnrichmentNeeds() {
  console.log('🔍 Reading PE leads sheet...\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('❌ No data found in sheet.');
    return [];
  }
  
  const headers = rows[0];
  console.log('📋 Headers:', headers.join(' | '));
  console.log(`📊 Total rows: ${rows.length - 1}\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0] || '';
    const contact = row[2] || '';
    const email = row[3] || '';
    const status = row[9] || '';
    
    // Skip if already sent or in certain statuses
    if (status === 'Sent' || status === 'Dead' || status === 'Enriched') continue;
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('admin@')
    );
    const hasNoEmail = !email || email.trim() === '';
    
    if (hasNoContact || hasGenericEmail || hasNoEmail) {
      needsEnrichment.push({
        row: i + 1,
        firm,
        contact,
        email,
        status,
        issue: hasNoContact ? 'No contact' : (hasNoEmail ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15
  const toEnrich = needsEnrichment.slice(0, 15);
  console.log('Top 15 targets:\n');
  toEnrich.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.firm} (Row ${lead.row})`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Current: ${lead.contact || '(empty)'} / ${lead.email || '(empty)'}\n`);
  });
  
  // Save for reference
  fs.writeFileSync('enrichment-targets-march8-536pm.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\n✅ Full list saved to enrichment-targets-march8-536pm.json`);
  
  return toEnrich;
}

analyzeEnrichmentNeeds().catch(console.error);
