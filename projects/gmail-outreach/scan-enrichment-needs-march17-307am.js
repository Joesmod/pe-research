const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:N';

async function scanEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Skip header
  const header = rows[0];
  console.log('Header:', header);
  console.log('\nColumns:');
  header.forEach((h, i) => console.log(`  ${i}: ${h}`));
  
  const dataRows = rows.slice(1);
  
  const needsEnrichment = [];
  const genericEmailPatterns = /^(info@|sales@|ir@|contact@|hello@|admin@|support@)/i;
  
  dataRows.forEach((row, idx) => {
    const actualRowNumber = idx + 2; // +2 because we skipped header and arrays are 0-indexed
    const companyName = row[0] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Check if needs enrichment
    const needsContact = !contactName || contactName.trim() === '';
    const needsEmail = !email || email.trim() === '' || genericEmailPatterns.test(email);
    
    if ((needsContact || needsEmail) && companyName.trim() !== '') {
      needsEnrichment.push({
        rowNumber: actualRowNumber,
        company: companyName,
        contactName: contactName || '(empty)',
        email: email || '(empty)',
        title: title || '(empty)',
        status: status || '(empty)',
        reason: needsContact && needsEmail ? 'No contact + no email' : 
                needsContact ? 'No contact name' : 'No/generic email'
      });
    }
  });

  console.log(`\n\n=== ENRICHMENT NEEDS SUMMARY ===`);
  console.log(`Total rows scanned: ${dataRows.length}`);
  console.log(`Rows needing enrichment: ${needsEnrichment.length}\n`);
  
  if (needsEnrichment.length > 0) {
    console.log(`First 15 firms needing enrichment:\n`);
    needsEnrichment.slice(0, 15).forEach(item => {
      console.log(`Row ${item.rowNumber}: ${item.company}`);
      console.log(`  Contact: ${item.contactName}`);
      console.log(`  Email: ${item.email}`);
      console.log(`  Title: ${item.title}`);
      console.log(`  Status: ${item.status}`);
      console.log(`  Reason: ${item.reason}\n`);
    });
  }
}

scanEnrichmentNeeds().catch(console.error);
