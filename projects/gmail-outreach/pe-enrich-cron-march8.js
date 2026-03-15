const { google } = require('googleapis');
const fs = require('fs');

async function enrichPELeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('\nTotal rows:', rows.length - 1);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already enriched or sent
    if (status && (status.includes('Enriched') || status.includes('Sent') || status.includes('Dead'))) {
      continue;
    }
    
    // Check if needs enrichment: empty contact name OR generic/empty email
    const hasGenericEmail = !email || 
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@');
    
    const needsContact = !contactName || contactName.trim() === '';
    
    if (needsContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contactName,
        email,
        status,
        issue: needsContact ? 'No contact name' : 'Generic/empty email'
      });
    }
  }
  
  console.log('\n=== LEADS NEEDING ENRICHMENT ===');
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15 for targeting
  const targets = needsEnrichment.slice(0, 15);
  targets.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Row: ${lead.rowIndex + 1}`);
    console.log(`   Issue: ${lead.issue}`);
    console.log(`   Contact: ${lead.contactName || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log();
  });
  
  // Save to file for processing
  fs.writeFileSync('enrich-targets-march8-236pm.json', JSON.stringify(targets, null, 2));
  
  return targets;
}

enrichPELeads().catch(console.error);
