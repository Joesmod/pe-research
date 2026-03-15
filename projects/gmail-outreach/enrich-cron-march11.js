const { google } = require('googleapis');
const fs = require('fs');

async function enrichPEFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  console.log('Headers:', rows[0]);
  console.log(`\nTotal rows: ${rows.length}`);
  
  // Find firms needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0];
    const contact = row[2];
    const email = row[4];
    const website = row[5];
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact.trim() === '';
    const hasNoEmail = !email || email.trim() === '' || !email.includes('@');
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    
    if ((hasNoContact || hasNoEmail || hasGenericEmail) && i < 320) {
      needsEnrichment.push({
        rowNum: i + 1,
        firm: firm || 'Unknown',
        contact: contact || '',
        email: email || '',
        website: website || '',
        row: row
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} firms needing enrichment`);
  console.log('\nFirst 15 to enrich:');
  needsEnrichment.slice(0, 15).forEach(item => {
    console.log(`\nRow ${item.rowNum}: ${item.firm}`);
    console.log(`  Contact: ${item.contact || 'EMPTY'}`);
    console.log(`  Email: ${item.email || 'EMPTY'}`);
    console.log(`  Website: ${item.website || 'NO WEBSITE'}`);
  });
  
  // Save to file for manual research
  fs.writeFileSync('enrichment-targets-march11.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  console.log('\n\nSaved targets to enrichment-targets-march11.json');
}

enrichPEFirms().catch(console.error);
