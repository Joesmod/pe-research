const { google } = require('googleapis');

async function findTargets() {
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
  
  // Skip header
  const dataRows = rows.slice(1);
  
  const needsEnrichment = [];
  
  dataRows.forEach((row, idx) => {
    const company = row[0] || '';
    const contactName = row[1] || '';
    const title = row[2] || '';
    const email = row[3] || '';
    const website = row[4] || '';
    const linkedin = row[5] || '';
    const status = row[8] || '';
    
    // Skip dead leads and duplicates
    if (status === 'Dead Lead' || status === 'DUPLICATE' || status === 'Contacted' || status === 'Enriched') {
      return;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        rowNumber: idx + 2, // +2 because header row + 0-indexed
        company,
        contactName,
        title,
        email,
        website,
        linkedin,
        status,
        reason: hasNoContact ? 'No contact name' : 'Generic/missing email'
      });
    }
  });
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
}

findTargets().catch(console.error);
