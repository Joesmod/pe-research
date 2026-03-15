const { google } = require('googleapis');
const fs = require('fs');

async function findAndEnrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  console.log('Headers:', headers);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Check if needs enrichment
    const hasGenericEmail = email.toLowerCase().startsWith('info@') || 
                           email.toLowerCase().startsWith('sales@') || 
                           email.toLowerCase().startsWith('ir@') ||
                           email.toLowerCase().startsWith('contact@');
    
    if ((contactName === '' || hasGenericEmail || email === '') && status !== 'Dead' && company !== '') {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contactName,
        email,
        status
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:`);
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  
  fs.writeFileSync('needs-enrichment-436pm.json', JSON.stringify(needsEnrichment, null, 2));
  
  return needsEnrichment;
}

findAndEnrichLeads().catch(console.error);
