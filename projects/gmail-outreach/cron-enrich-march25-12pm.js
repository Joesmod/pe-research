const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('Starting PE enrichment - March 25, 12:46 PM');
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  console.log('Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:P',
  });
  
  const rows = response.data.values || [];
  const headers = rows[0] || [];
  
  console.log(`Headers: ${headers.join(', ')}`);
  console.log(`Total rows: ${rows.length}`);
  
  // Find column indices
  const colMap = {};
  headers.forEach((h, i) => {
    colMap[h] = i;
  });
  
  // Scan for leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = row[colMap['Company']] || '';
    const contactName = row[colMap['Contact Name']] || '';
    const email = row[colMap['Email']] || '';
    const status = row[colMap['Status']] || '';
    const domain = row[colMap['Domain']] || '';
    
    // Skip if already sent or dead
    if (status === 'Sent' || status === 'Dead' || status === 'No Contact Found') continue;
    
    // Need enrichment if:
    // - No contact name
    // - No email or generic email
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        domain,
        contactName,
        email,
        status,
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
  console.log('\nFirst 15 candidates:');
  needsEnrichment.slice(0, 15).forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.company} | Contact: ${lead.contactName || '(empty)'} | Email: ${lead.email || '(empty)'}`);
  });
  
  // Save to file for manual research
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-queue.json'),
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log('\nSaved enrichment queue to enrichment-queue.json');
  console.log('Ready for manual research phase.');
}

main().catch(console.error);
