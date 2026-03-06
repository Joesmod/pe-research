const { google } = require('googleapis');
const fs = require('fs');

async function enrichPELeads() {
  console.log('Starting PE enrichment run at:', new Date().toISOString());
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current data
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = result.data.values;
  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('Total rows:', rows.length);
  
  // Find rows that need enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || ''; // Column J - Status
    
    // Skip if status is Dead, Contacted, or Replied
    if (status === 'Dead' || status === 'Contacted' || status === 'Replied') {
      continue;
    }
    
    // Needs enrichment if:
    // - No contact name, OR
    // - No email, OR  
    // - Generic email (info@, sales@, ir@, investor@, contact@)
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'investor@', 'contact@', 'hello@', 'admin@'];
    const hasGenericEmail = email && genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contactName,
        email,
        website: row[5] || '',
        linkedin: row[6] || '',
        reason: !contactName ? 'No contact name' : !email ? 'No email' : 'Generic email'
      });
    }
  }
  
  console.log('\n=== ENRICHMENT TARGETS ===');
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Save for external processing
  fs.writeFileSync('pe-enrich-targets-11pm.json', JSON.stringify(needsEnrichment, null, 2));
  
  // Show first 15
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.company}`);
    console.log(`   Row: ${lead.rowIndex}, Reason: ${lead.reason}`);
    console.log(`   Current: ${lead.contactName || '(none)'} / ${lead.email || '(none)'}`);
    console.log(`   Website: ${lead.website}`);
    console.log('');
  });
  
  console.log(`\nFull list saved to: pe-enrich-targets-11pm.json`);
  console.log(`\nNext: Manually research these firms and update the sheet.`);
}

enrichPELeads().catch(console.error);
