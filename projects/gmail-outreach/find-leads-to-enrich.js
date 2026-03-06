const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const isGenericEmail = (email) => {
  if (!email) return true;
  const lower = email.toLowerCase();
  return lower.startsWith('info@') || 
         lower.startsWith('sales@') || 
         lower.startsWith('ir@') ||
         lower.startsWith('contact@') ||
         lower.startsWith('hello@') ||
         lower === '';
};

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K'
    });
    
    const rows = res.data.values || [];
    const header = rows[0];
    
    console.log('Columns:', header);
    console.log('\nLEADS NEEDING ENRICHMENT:\n');
    
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const website = row[1] || '';
      const contactName = row[2] || '';
      const title = row[3] || '';
      const email = row[4] || '';
      const status = row[9] || '';
      
      // Skip if already enriched or has good data
      if (status === 'Enriched' && contactName && !isGenericEmail(email)) {
        continue;
      }
      
      // Needs enrichment if: no contact name OR generic email
      if (!contactName || isGenericEmail(email)) {
        needsEnrichment.push({
          rowIndex: i + 1, // 1-indexed for sheet
          company,
          website,
          contactName,
          title,
          email,
          status
        });
      }
    }
    
    console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
    
    // Show first 20
    needsEnrichment.slice(0, 20).forEach(lead => {
      console.log(`Row ${lead.rowIndex}: ${lead.company}`);
      console.log(`  Website: ${lead.website}`);
      console.log(`  Contact: ${lead.contactName || '(EMPTY)'}`);
      console.log(`  Email: ${lead.email || '(EMPTY)'}`);
      console.log(`  Status: ${lead.status}`);
      console.log('');
    });
    
    // Save full list to file for processing
    fs.writeFileSync('leads-to-enrich.json', JSON.stringify(needsEnrichment, null, 2));
    console.log(`\nFull list saved to leads-to-enrich.json (${needsEnrichment.length} leads)`);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
