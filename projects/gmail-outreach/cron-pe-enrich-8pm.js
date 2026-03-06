const fs = require('fs');
const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });

  const rows = result.data.values || [];
  if (rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const companyName = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || ''; // Status column
    
    // Skip if already enriched
    if (status.toLowerCase().includes('enriched')) continue;
    if (status.toLowerCase().includes('sent')) continue;
    if (status.toLowerCase().includes('dead')) continue;
    
    // Check if needs enrichment
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.trim() === '';
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        companyName,
        contactName,
        email,
        website: row[5] || '',
        linkedin: row[6] || '',
        status
      });
    }
  }

  console.log(`\n=== FOUND ${needsEnrichment.length} LEADS NEEDING ENRICHMENT ===\n`);
  
  // Show first 20
  const toShow = needsEnrichment.slice(0, 20);
  toShow.forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.companyName}`);
    console.log(`  Contact: ${lead.contactName || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Website: ${lead.website}`);
    console.log('');
  });

  // Save for processing
  fs.writeFileSync('enrichment-targets-8pm.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`Saved ${needsEnrichment.length} targets to enrichment-targets-8pm.json`);
}

main().catch(console.error);
