const { google } = require('googleapis');

async function findEnrichmentTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values;
  const targets = [];
  
  // Find rows with contact name but no/generic email (rows 1-200)
  for (let i = 1; i < Math.min(rows.length, 200); i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    
    // Has contact name and title, but missing or generic email
    if (contact && contact.trim() && title && title.trim() && 
        (!email || 
         email.toLowerCase().includes('info@') ||
         email.toLowerCase().includes('ir@') ||
         email.toLowerCase().includes('contact@') ||
         email.toLowerCase().includes('sales@') ||
         email === title || // Email column has title instead
         email === company)) { // Email column has company instead
      
      targets.push({
        row: i + 1,
        company,
        contact,
        title,
        currentEmail: email || 'MISSING'
      });
    }
  }
  
  console.log('Top enrichment targets (have contact name, need real email):');
  console.log('='.repeat(70));
  targets.slice(0, 12).forEach(t => {
    console.log(`\nRow ${t.row}: ${t.company}`);
    console.log(`  Contact: ${t.contact}`);
    console.log(`  Title: ${t.title}`);
    console.log(`  Current Email: ${t.currentEmail}`);
  });
  
  console.log(`\n\nTotal found: ${targets.length} firms need enrichment`);
}

findEnrichmentTargets().catch(console.error);
