const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const contact = row[2];
    const email = row[4];
    const status = row[9];
    
    // Skip if already enriched or if missing company
    if (!company || status === 'Enriched') continue;
    
    // Need enrichment if:
    // - Contact is Jacob Zodikoff (placeholder)
    // - Contact is empty
    // - Email is generic or empty
    const isPlaceholder = contact === 'Jacob Zodikoff' || !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
                           email.startsWith('info@') || 
                           email.startsWith('sales@') ||
                           email.startsWith('ir@') ||
                           email.trim() === '';
    
    if (isPlaceholder || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for sheet
        company,
        website: row[1],
        contact,
        title: row[3],
        email,
        linkedin: row[6],
        sectors: row[7],
        status
      });
    }
  }
  
  console.log(`\nFound ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15
  const targets = needsEnrichment.slice(0, 15);
  
  targets.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Status: ${lead.status || 'New'}`);
    console.log('');
  });
  
  // Save to file for reference
  fs.writeFileSync('enrichment-targets-march5-206am.json', JSON.stringify(targets, null, 2));
  console.log('Saved targets to enrichment-targets-march5-206am.json');
}

main().catch(console.error);
