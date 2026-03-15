const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function readAndEnrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found in sheet.');
    return;
  }

  const headers = rows[0];
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');

  console.log(`Found ${rows.length} rows (including header)`);
  console.log(`Headers: ${headers.join(', ')}`);

  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if status is "Dead Lead" or empty company
    if (status === 'Dead Lead' || !company.trim()) continue;
    
    // Need enrichment if:
    // 1. No contact name, OR
    // 2. No email OR generic email (info@, sales@, ir@, contact@, admin@)
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];
    const hasGenericEmail = genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));
    
    if (!contact.trim() || !email.trim() || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        status,
        reason: !contact.trim() ? 'No contact' : 
                !email.trim() ? 'No email' : 'Generic email'
      });
    }
  }

  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment`);
  
  // Save to file for inspection
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-needs-march10-1136pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );

  // Print summary
  console.log('\nTop 15 leads needing enrichment:');
  needsEnrichment.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company} - ${lead.reason}`);
  });

  return needsEnrichment;
}

readAndEnrichLeads()
  .then(() => console.log('\n✅ Analysis complete'))
  .catch(err => console.error('❌ Error:', err));
