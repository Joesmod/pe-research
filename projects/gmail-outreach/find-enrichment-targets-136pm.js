const { google } = require('googleapis');

async function findTargets() {
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
  const header = rows[0];
  const dataRows = rows.slice(1);
  
  console.log(`Total rows: ${dataRows.length}`);
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  
  dataRows.forEach((row, idx) => {
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip dead firms
    if (status.toLowerCase().includes('dead')) return;
    
    // Check if needs enrichment
    const noContact = !contactName || contactName === 'Jacob Zodikoff' || contactName.trim() === '';
    const genericEmail = !email || 
                         email.includes('info@') || 
                         email.includes('sales@') || 
                         email.includes('ir@') ||
                         email.includes('contact@') ||
                         email.trim() === '';
    
    if (noContact || genericEmail) {
      needsEnrichment.push({
        rowNum: idx + 2,
        company,
        website,
        contactName: contactName || '[EMPTY]',
        email: email || '[EMPTY]',
        status,
        reason: noContact ? 'Missing/placeholder contact' : 'Generic email'
      });
    }
  });
  
  console.log(`\nFound ${needsEnrichment.length} firms needing enrichment\n`);
  
  // Show first 15
  const targets = needsEnrichment.slice(0, 15);
  targets.forEach(t => {
    console.log(`${t.rowNum}. ${t.company}`);
    console.log(`   Website: ${t.website}`);
    console.log(`   Contact: ${t.contactName}`);
    console.log(`   Email: ${t.email}`);
    console.log(`   Status: ${t.status}`);
    console.log(`   Reason: ${t.reason}\n`);
  });
  
  return targets;
}

findTargets().catch(console.error);
