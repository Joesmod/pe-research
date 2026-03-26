const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function scanForEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return [];
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Skip empty company rows
    if (!company || company.trim() === '') continue;
    
    // Skip Dead or fully Enriched
    if (status === 'Dead' || status === 'Not PE') continue;
    if (status === 'Enriched' && contact && email && !email.match(/^(info|sales|ir|contact|hello|support)@/i)) {
      continue;
    }
    
    // Check if needs enrichment
    const hasEmptyContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|support)@/i);
    const hasEmptyEmail = !email || email.trim() === '';
    
    if (hasEmptyContact || hasGenericEmail || hasEmptyEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        reason: hasEmptyContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }

  console.log(`\n=== FIRMS NEEDING ENRICHMENT ===`);
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  needsEnrichment.slice(0, 20).forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  Contact: ${item.contact || 'EMPTY'}`);
    console.log(`  Email: ${item.email || 'EMPTY'}`);
    console.log(`  Status: ${item.status || 'N/A'}`);
    console.log(`  Reason: ${item.reason}\n`);
  });
  
  return needsEnrichment;
}

scanForEnrichment().catch(console.error);
