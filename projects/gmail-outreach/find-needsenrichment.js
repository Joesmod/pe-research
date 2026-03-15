const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function findNeedsEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:L',
  });

  const rows = response.data.values || [];
  let count = 0;
  
  console.log('Firms needing enrichment (missing contact or generic email):\n');
  
  for (let i = 1; i < rows.length && count < 20; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[8] || '';
    
    // Skip dead leads and non-PE firms
    if (status === 'Dead' || status === 'Not PE Firm') continue;
    
    // Find firms needing enrichment
    if (!contact || 
        !email || 
        email.startsWith('info@') || 
        email.startsWith('sales@') || 
        email.startsWith('ir@') ||
        email.startsWith('inquiries@') ||
        contact.includes('Media') || 
        contact.includes('Relations')) {
      console.log(`Row ${i+1}: ${company}`);
      console.log(`  Contact: ${contact || '(empty)'}`);
      console.log(`  Email: ${email || '(empty)'}`);
      console.log(`  Status: ${status}\n`);
      count++;
    }
  }
  
  console.log(`\nFound ${count} firms needing enrichment`);
}

findNeedsEnrichment().catch(console.error);
