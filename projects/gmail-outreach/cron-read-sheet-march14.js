const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });
  
  const allRows = result.data.values;
  if (!allRows || allRows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = allRows[0];
  const rows = allRows.slice(1);
  
  console.log(`Total rows: ${rows.length}`);
  console.log(`Headers: ${headers.join(' | ')}\n`);
  
  // Find leads needing enrichment (empty contact name or generic email)
  const needsEnrichment = rows.filter(row => {
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip if status is Dead, Sent, Bounced, or Replied
    if (['Dead', 'Sent', 'Bounced', 'Replied'].includes(status)) {
      return false;
    }
    
    // Check if contact is empty
    const emptyContact = !contact || contact.trim() === '';
    
    // Check if email is empty or generic
    const genericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('hello@') ||
      email.includes('inquiries@');
    
    return company && (emptyContact || genericEmail);
  });
  
  console.log(`\nLeads needing enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 15 that need enrichment
  const toEnrich = needsEnrichment.slice(0, 15);
  toEnrich.forEach((row, idx) => {
    console.log(`${idx + 1}. ${row[0]}`); // Company
    console.log(`   Contact: ${row[2] || '[EMPTY]'}`);
    console.log(`   Email: ${row[4] || '[EMPTY]'}`);
    console.log(`   Title: ${row[3] || '[EMPTY]'}`);
    console.log(`   Status: ${row[7] || '[EMPTY]'}`);
    console.log(`   Website: ${row[1] || '[EMPTY]'}\n`);
  });
}

main().catch(console.error);
