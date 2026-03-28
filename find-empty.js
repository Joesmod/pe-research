const { google } = require('googleapis');
const key = require('../gmail-outreach/service-account.json');

(async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:H300',
  });
  
  const rows = res.data.values;
  let count = 0;
  
  rows.forEach((row, i) => {
    if (i === 0) return; // Skip header
    
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[6] || '';
    
    // Check if needs enrichment: empty contact OR generic email
    const needsEnrichment = !contact || 
                            email.startsWith('info@') || 
                            email.startsWith('sales@') || 
                            email.startsWith('ir@') ||
                            email.startsWith('contact@') ||
                            email === '';
    
    if (needsEnrichment && company && count < 20) {
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Contact: ${contact || 'EMPTY'}`);
      console.log(`  Email: ${email || 'EMPTY'}`);
      console.log(`  Status: ${status || 'EMPTY'}`);
      console.log('');
      count++;
    }
  });
  
  console.log(`Found ${count} leads needing enrichment`);
})();
