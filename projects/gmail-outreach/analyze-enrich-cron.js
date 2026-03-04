const { google } = require('googleapis');

async function analyzeSheet() {
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
  const header = rows[0];
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const companyName = row[0] || '';
    const contactName = row[1] || '';
    const email = row[3] || '';
    const status = row[8] || '';
    
    // Skip if already contacted or if company name is empty
    if (!companyName || status === 'Contacted') continue;
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || 
                           email.includes('info@') || 
                           email.includes('sales@') || 
                           email.includes('ir@') ||
                           email.includes('contact@') ||
                           email.trim() === '';
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company: companyName,
        contactName,
        email,
        website: row[4] || '',
        linkedin: row[5] || '',
        status
      });
    }
  }
  
  console.log(`Total firms needing enrichment: ${needsEnrichment.length}\n`);
  console.log('First 15 firms to enrich:\n');
  
  needsEnrichment.slice(0, 15).forEach((firm, idx) => {
    console.log(`${idx + 1}. Row ${firm.row}: ${firm.company}`);
    console.log(`   Contact: ${firm.contactName || '(empty)'}`);
    console.log(`   Email: ${firm.email || '(empty)'}`);
    console.log(`   Website: ${firm.website}`);
    console.log(`   Status: ${firm.status || 'New'}`);
    console.log('');
  });
}

analyzeSheet().catch(console.error);
