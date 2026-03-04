const { google } = require('googleapis');

async function findActiveEnrichmentTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = result.data.values || [];
  
  // Find active leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[1] || '';
    const title = row[2] || '';
    const email = row[3] || '';
    const status = row[8] || '';
    
    // Skip dead/bounced/contacted/duplicate
    if (status === 'Dead' || 
        status === 'Bounced' || 
        status === 'Dead Lead' ||
        status === 'DUPLICATE' ||
        status === 'Contacted') continue;
    
    // Check if needs enrichment
    const needsContact = !contact || contact.trim() === '' || contact === 'Not identified';
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@')
    );
    const noEmail = !email || email.trim() === '';
    
    if (needsContact || hasGenericEmail || noEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        status,
        website: row[4] || '',
        linkedin: row[5] || ''
      });
    }
  }
  
  console.log(JSON.stringify(needsEnrichment, null, 2));
  console.error(`\nFound ${needsEnrichment.length} active leads needing enrichment`);
}

findActiveEnrichmentTargets().catch(console.error);
