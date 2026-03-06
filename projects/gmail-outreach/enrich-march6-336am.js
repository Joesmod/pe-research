const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Helper to identify leads needing enrichment
function needsEnrichment(row) {
  const [firmName, website, contactName, title, email, , , , , status] = row;
  
  // Skip if already enriched or dead
  if (status && (status.includes('Enriched') || status.includes('Dead'))) {
    return false;
  }
  
  // Check for missing contact name
  const missingName = !contactName || contactName.trim() === '' || contactName === 'Jacob Zodikoff';
  
  // Check for generic/missing email
  const missingEmail = !email || email.trim() === '';
  const genericEmail = email && (
    email.startsWith('info@') ||
    email.startsWith('sales@') ||
    email.startsWith('ir@') ||
    email.startsWith('contact@')
  );
  
  return missingName || missingEmail || genericEmail;
}

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read current sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values || [];
  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  
  // Find rows that need enrichment
  const toEnrich = [];
  dataRows.forEach((row, idx) => {
    if (needsEnrichment(row)) {
      toEnrich.push({
        rowIndex: idx + 2, // +2 for header and 1-based indexing
        firmName: row[0],
        website: row[1],
        contactName: row[2],
        email: row[4],
        status: row[9]
      });
    }
  });
  
  console.log(`\nFound ${toEnrich.length} leads that need enrichment:\n`);
  toEnrich.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.firmName}`);
    console.log(`  Current: ${lead.contactName || '(missing)'} | ${lead.email || '(missing)'}`);
    console.log(`  Status: ${lead.status || 'New'}`);
    console.log('');
  });
  
  console.log(`\n=== ENRICHMENT TARGETS (first 15) ===`);
  console.log(JSON.stringify(toEnrich.slice(0, 15), null, 2));
  
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
