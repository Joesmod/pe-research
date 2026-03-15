const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A:J'
  });
  
  const rows = response.data.values;
  const header = rows[0];
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip dead leads
    if (status.toLowerCase().includes('dead')) continue;
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email.toLowerCase().includes('info@') || 
                           email.toLowerCase().includes('sales@') || 
                           email.toLowerCase().includes('ir@') ||
                           !email || email.trim() === '';
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status,
        reason: hasNoContact ? 'No contact name' : 'Generic/missing email'
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT ANALYSIS ===`);
  console.log(`Total firms: ${rows.length - 1}`);
  console.log(`Need enrichment: ${needsEnrichment.length}`);
  console.log(`\n--- FIRMS NEEDING ENRICHMENT ---\n`);
  
  needsEnrichment.slice(0, 20).forEach(firm => {
    console.log(`${firm.company} | ${firm.website}`);
    console.log(`  Current: ${firm.contactName || '(empty)'} / ${firm.email || '(empty)'}`);
    console.log(`  Reason: ${firm.reason}`);
    console.log(`  Status: ${firm.status || 'New - Unresearched'}`);
    console.log('');
  });
  
  fs.writeFileSync('enrichment-targets-march8.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march8.json`);
})();
