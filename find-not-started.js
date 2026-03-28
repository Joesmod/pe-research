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
    range: 'Sheet1!A1:I300',
  });
  
  const rows = res.data.values;
  let count = 0;
  
  console.log('=== LEADS NEEDING ENRICHMENT ===\n');
  
  rows.forEach((row, i) => {
    if (i === 0) return; // Skip header
    
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedin = row[5] || '';
    const status = row[6] || '';
    const notes = row[7] || '';
    
    // Focus on rows without proper contacts or with "Not Started" status
    const needsWork = (status === 'Not Started' || status === '' || status === 'Needs Research') ||
                      (!contact || contact === 'Founder & Co-CEO' || contact === 'Founding Partner & President') ||
                      (!email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@'));
    
    if (needsWork && company && count < 25) {
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Website: ${website}`);
      console.log(`  Contact: ${contact || 'EMPTY'}`);
      console.log(`  Title: ${title || 'EMPTY'}`);
      console.log(`  Email: ${email || 'EMPTY'}`);
      console.log(`  Status: ${status || 'EMPTY'}`);
      console.log('');
      count++;
    }
  });
  
  console.log(`\n=== Found ${count} leads needing enrichment ===`);
})();
