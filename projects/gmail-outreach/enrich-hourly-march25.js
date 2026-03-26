const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:M`,
  });

  const rows = response.data.values || [];
  if (rows.length < 2) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const companyName = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip empty rows (no company name)
    if (!companyName.trim()) {
      continue;
    }
    
    // Skip if already enriched with valid contact
    if (status === 'Enriched' && contactName && email && 
        !email.match(/^(info|sales|ir|contact|admin|hello)@/i)) {
      continue;
    }
    
    // Need enrichment if:
    // 1. No contact name
    // 2. No email
    // 3. Generic email (info@, sales@, ir@, etc.)
    const hasGenericEmail = email.match(/^(info|sales|ir|contact|admin|hello|press|media|support)@/i);
    
    if (!contactName || !email || hasGenericEmail) {
      needsEnrichment.push({
        row: i + 1,
        company: companyName,
        currentContact: contactName,
        currentEmail: email,
        status: status,
        website: row[1] || '',
        reason: !contactName ? 'No contact' : 
                !email ? 'No email' : 
                'Generic email'
      });
    }
  }
  
  console.log(`\n=== ENRICHMENT CANDIDATES (${needsEnrichment.length} total) ===\n`);
  
  // Show first 15
  const batch = needsEnrichment.slice(0, 15);
  batch.forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  Current: ${item.currentContact || '(none)'} | ${item.currentEmail || '(none)'}`);
    console.log(`  Reason: ${item.reason} | Status: ${item.status}`);
    console.log('');
  });
  
  console.log(`\nShowing 15 of ${needsEnrichment.length} candidates.`);
  console.log(`Ready to begin web research for these firms.\n`);
}

main().catch(console.error);
