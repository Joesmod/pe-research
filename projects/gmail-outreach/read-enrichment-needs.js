const { google } = require('googleapis');

async function readEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  console.log('Headers:', header);
  console.log('\n=== Firms Needing Enrichment ===\n');
  
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[3] || '';
    const email = row[5] || '';
    const status = row[9] || '';
    
    // Skip if already "Dead" or "Sent" or has valid contact
    if (status === 'Dead' || status === 'Sent') continue;
    
    // Check if needs enrichment: no contact name OR generic email
    const hasGenericEmail = email.match(/^(info|sales|contact|ir|hello|support)@/i);
    const needsContact = !contactName || contactName.trim() === '';
    const needsRealEmail = !email || hasGenericEmail;
    
    if (needsContact || needsRealEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contactName,
        email,
        status,
        needsContact,
        needsRealEmail
      });
    }
  }
  
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Needs enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 15
  needsEnrichment.slice(0, 15).forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  Contact: ${item.contactName || '(empty)'}`);
    console.log(`  Email: ${item.email || '(empty)'}`);
    console.log(`  Status: ${item.status || '(empty)'}`);
    console.log(`  Needs: ${item.needsContact ? 'Contact' : ''} ${item.needsRealEmail ? 'Real Email' : ''}`);
    console.log();
  });
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-march4-7am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march4-7am.json`);
}

readEnrichmentNeeds().catch(console.error);
