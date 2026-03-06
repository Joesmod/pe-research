const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

async function fetchSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values || [];
  const header = rows[0];
  
  console.log('Header:', header);
  console.log(`\nTotal rows: ${rows.length - 1}\n`);
  
  // Find column indices
  const companyCol = header.indexOf('Company');
  const contactCol = header.indexOf('Contact Name');
  const titleCol = header.indexOf('Position/Title');
  const emailCol = header.indexOf('Email');
  const statusCol = header.indexOf('Status');
  const notesCol = header.indexOf('Notes');

  // Find rows needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    
    if (company && (noContact || genericEmail) && status !== 'Dead' && !status.includes('Dead')) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: noContact ? 'No contact' : 'Generic email'
      });
    }
  }
  
  console.log(`\n📊 Rows needing enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 15
  const toShow = needsEnrichment.slice(0, 15);
  toShow.forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  Contact: ${item.contact || '(empty)'}`);
    console.log(`  Email: ${item.email || '(empty)'}`);
    console.log(`  Status: ${item.status || '(empty)'}`);
    console.log(`  Reason: ${item.reason}`);
    console.log('');
  });
  
  // Save to file for processing
  fs.writeFileSync('enrichment-targets-march5-506pm.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\n✅ Saved ${needsEnrichment.length} targets to enrichment-targets-march5-506pm.json`);
}

fetchSheet().catch(console.error);
