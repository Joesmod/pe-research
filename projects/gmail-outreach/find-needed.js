const { google } = require('googleapis');

async function findNeeded() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = result.data.values;
  
  console.log('Firms needing enrichment (empty contact or generic email):\n');
  
  let count = 0;
  console.log(`Total rows in sheet: ${rows.length}\n`);
  
  for (let i = 1; i < rows.length; i++) { // Check all rows
    const company = rows[i][0];
    const contact = rows[i][2];
    const email = rows[i][4];
    
    // Check if needs enrichment: empty contact OR generic email
    const needsEnrichment = 
      !contact || 
      contact.trim() === '' ||
      (email && (
        email.includes('info@') || 
        email.includes('sales@') || 
        email.includes('ir@') ||
        email.includes('contact@') ||
        email.includes('general@')
      ));
    
    if (needsEnrichment && company) {
      console.log(`Row ${i+1}: ${company}`);
      console.log(`  Contact: ${contact || 'EMPTY'}`);
      console.log(`  Email: ${email || 'EMPTY'}`);
      console.log('');
      count++;
      
      if (count >= 15) break; // Limit to 15
    }
  }
  
  console.log(`\nFound ${count} firms needing enrichment out of ${rows.length} total rows.`);
}

findNeeded().catch(console.error);
