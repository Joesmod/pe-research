const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

// Based on actual data inspection:
// Col 0: Company Name
// Col 1: Domain
// Col 2: Contact Name  
// Col 3: Title
// Col 4: Email
// Col 5: Additional URL/field
// Col 6: LinkedIn
// Col 7: Status/Enrichment marker
// Col 8: Notes
// Col 9: Status (Enriched/Researched/Needs Email/etc)

async function main() {
  console.log('PE Enrichment Scan - March 25, 12:46 PM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read sheet (skip header row 0)
  console.log('Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:P',  // Start from row 2 to skip corrupted headers
  });
  
  const rows = response.data.values || [];
  console.log(`Total rows: ${rows.length}\n`);
  
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const domain = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();
    
    // Skip empty company rows
    if (!company) continue;
    
    // Skip if already sent or dead
    if (status === 'Sent' || status === 'Dead' || status === 'No Contact Found') continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const needsWork = !contactName || !email || hasGenericEmail;
    
    if (needsWork) {
      needsEnrichment.push({
        rowIndex: i + 2, // +2 because we started from row 2
        company,
        domain,
        contactName: contactName || '(empty)',
        title: title || '',
        email: email || '(empty)',
        status: status || '(empty)',
        reason: !contactName ? 'No contact name' : 
                !email ? 'No email' : 
                'Generic email'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15
  console.log('First 15 candidates for enrichment:\n');
  needsEnrichment.slice(0, 15).forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.company}`);
    console.log(`   Domain: ${lead.domain || '(none)'}`);
    console.log(`   Current: ${lead.contactName} | ${lead.email}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  // Save queue
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-queue.json'),
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log('Saved first 15 to enrichment-queue.json');
  console.log('\nReady to begin manual research.');
}

main().catch(console.error);
