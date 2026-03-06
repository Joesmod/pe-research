const { google } = require('googleapis');
const fs = require('fs');

async function readAndAnalyzeSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers);
  console.log('Total rows:', rows.length - 1);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip if status is Dead
    if (status.toLowerCase() === 'dead') continue;
    
    // Check if needs enrichment
    const noContact = !contactName || contactName.trim() === '';
    const genericEmail = !email || 
                        email.includes('info@') || 
                        email.includes('sales@') || 
                        email.includes('ir@') ||
                        email.includes('contact@') ||
                        email.trim() === '';
    
    if (noContact || genericEmail) {
      needsEnrichment.push({
        row: i + 1,
        firm,
        contactName,
        email,
        status,
        reason: noContact ? 'No contact name' : 'Generic/missing email'
      });
    }
  }
  
  console.log('\n=== LEADS NEEDING ENRICHMENT ===');
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15
  const toEnrich = needsEnrichment.slice(0, 15);
  toEnrich.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.firm}`);
    console.log(`   Row: ${lead.row} | Contact: "${lead.contactName}" | Email: "${lead.email}"`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  // Save to file
  fs.writeFileSync('leads-to-enrich-1206pm.json', JSON.stringify(toEnrich, null, 2));
  console.log(`\nSaved ${toEnrich.length} leads to leads-to-enrich-1206pm.json`);
}

readAndAnalyzeSheet().catch(console.error);
