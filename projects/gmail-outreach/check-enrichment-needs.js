const { google } = require('googleapis');

async function checkSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = response.data.values;
  let needsEnrichment = [];
  
  rows.forEach((row, idx) => {
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (idx > 0 && company && 
        (!contact || !email || 
         email.includes('info@') || 
         email.includes('ir@') || 
         email.includes('sales@') || 
         email.includes('contact@')) && 
        status !== 'DEAD LEAD' && 
        status !== 'Enriched') {
      needsEnrichment.push({
        row: idx + 1,
        company,
        contact,
        email,
        status
      });
    }
  });
  
  console.log(`Total firms needing enrichment: ${needsEnrichment.length}`);
  console.log('\nTop 20 firms needing enrichment:');
  needsEnrichment.slice(0, 20).forEach(item => {
    console.log(`Row ${item.row}: ${item.company} | Contact: '${item.contact}' | Email: '${item.email}' | Status: '${item.status}'`);
  });
}

checkSheet().catch(console.error);
