const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:O';

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

  console.log(`Total rows: ${rows.length}\n`);
  
  const needsEnrichment = [];
  const genericEmailPatterns = /^(info@|sales@|ir@|contact@|hello@|admin@|support@)/i;
  
  rows.forEach((row, idx) => {
    const rowNumber = idx + 1;
    const companyName = (row[0] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    // Check if needs enrichment
    const hasCompany = companyName !== '';
    const needsContact = !contactName || contactName === '';
    const needsEmail = !email || email === '' || genericEmailPatterns.test(email);
    
    if (hasCompany && (needsContact || needsEmail)) {
      needsEnrichment.push({
        rowNumber,
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

  console.log(`=== ENRICHMENT NEEDS SUMMARY ===`);
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
    
    console.log(`\nRow numbers to enrich: ${needsEnrichment.slice(0, 15).map(n => n.rowNumber).join(', ')}`);
  } else {
    console.log('✅ All firms have contact names and verified emails!');
  }
  
  return needsEnrichment;
}

scanEnrichmentNeeds().catch(console.error);
