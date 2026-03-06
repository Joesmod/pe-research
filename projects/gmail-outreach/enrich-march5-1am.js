const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read the sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = result.data.values || [];
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log('\n=== FIRMS NEEDING ENRICHMENT ===\n');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Check if needs enrichment: empty contact OR generic email OR status = New/Partial
    const hasGenericEmail = email && (email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@'));
    const statusNeedsWork = status.includes('New - Unresearched') || status.includes('Partial') || status === '';
    
    if (!contactName || hasGenericEmail || (statusNeedsWork && !email)) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName,
        title,
        email,
        status,
        reason: !contactName ? 'No contact' : hasGenericEmail ? 'Generic email' : 'Status needs work'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  // Show first 20 for review
  needsEnrichment.slice(0, 20).forEach(firm => {
    console.log(`Row ${firm.rowIndex}: ${firm.company}`);
    console.log(`  Website: ${firm.website}`);
    console.log(`  Contact: ${firm.contactName || '(EMPTY)'}`);
    console.log(`  Email: ${firm.email || '(EMPTY)'}`);
    console.log(`  Status: ${firm.status}`);
    console.log(`  Reason: ${firm.reason}`);
    console.log('');
  });
  
  // Write to file for reference
  fs.writeFileSync(
    'enrichment-targets-march5-1am.json',
    JSON.stringify(needsEnrichment.slice(0, 20), null, 2)
  );
  
  console.log('\n=== TARGET LIST SAVED ===');
  console.log('File: enrichment-targets-march5-1am.json');
})();
