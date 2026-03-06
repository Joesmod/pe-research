const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Generic email patterns we want to replace
const GENERIC_PATTERNS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'inquiries@'];

async function findLeadsNeedingEnrichment() {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    
    // Skip if company name is empty
    if (!company.trim()) continue;
    
    // Needs enrichment if:
    // 1. Contact Name is empty OR
    // 2. Email is empty OR 
    // 3. Email matches generic pattern
    const hasGenericEmail = GENERIC_PATTERNS.some(pattern => email.toLowerCase().includes(pattern));
    
    if (!contactName.trim() || !email.trim() || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // Sheet row number (1-indexed, +1 for header)
        company: company,
        website: row[5] || '',
        currentContact: contactName,
        currentEmail: email,
        linkedin: row[6] || '',
        sector: row[7] || '',
        notes: row[8] || ''
      });
    }
  }
  
  return needsEnrichment;
}

(async () => {
  try {
    const targets = await findLeadsNeedingEnrichment();
    console.log(`\n=== ENRICHMENT TARGETS (${targets.length} total) ===\n`);
    
    // Limit to first 15 for this run
    const batch = targets.slice(0, 15);
    console.log(`Processing first ${batch.length} targets:\n`);
    
    batch.forEach((target, idx) => {
      console.log(`${idx + 1}. ${target.company} (Row ${target.rowIndex})`);
      console.log(`   Website: ${target.website || 'N/A'}`);
      console.log(`   Current: ${target.currentContact || 'EMPTY'} / ${target.currentEmail || 'EMPTY'}`);
      console.log(`   Sector: ${target.sector || 'N/A'}`);
      console.log('');
    });
    
    // Save to file for reference
    const fs = require('fs');
    fs.writeFileSync('enrichment-targets-march4-11am.json', JSON.stringify(batch, null, 2));
    console.log(`\nSaved ${batch.length} targets to enrichment-targets-march4-11am.json`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
