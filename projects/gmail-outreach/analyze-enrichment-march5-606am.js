const { google } = require('googleapis');

async function analyzeEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:L',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Skip header row
  const headers = rows[0];
  const data = rows.slice(1);
  
  console.log('Headers:', headers);
  console.log('\n=== FIRMS NEEDING ENRICHMENT ===\n');
  
  let needsEnrichment = [];
  
  data.forEach((row, idx) => {
    const company = row[0] || '';
    const contact = row[2] || '';  // Column C - Contact Name
    const email = row[4] || '';    // Column E - Email
    const status = row[9] || '';   // Column J - Status
    
    // Skip if already enriched or marked dead
    if (status && (status.toLowerCase().includes('enriched') || status.toLowerCase().includes('dead'))) {
      return;
    }
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact === 'Jacob Zodikoff';
    const hasGenericEmail = !email || email.match(/@.*\b(info|sales|ir|contact|admin|general|hello|support)\b/i);
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({
        row: idx + 2, // +2 because of header and 1-indexed
        company,
        contact,
        email,
        website: row[1],
        linkedin: row[6],
        status
      });
    }
  });
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  
  // Show first 20
  needsEnrichment.slice(0, 20).forEach(firm => {
    console.log(`Row ${firm.row}: ${firm.company}`);
    console.log(`  Contact: ${firm.contact || '(EMPTY)'}`);
    console.log(`  Email: ${firm.email || '(EMPTY)'}`);
    console.log(`  Website: ${firm.website || '(none)'}`);
    console.log(`  Status: ${firm.status || 'New'}`);
    console.log('');
  });
  
  console.log(`\n...and ${Math.max(0, needsEnrichment.length - 20)} more\n`);
}

analyzeEnrichmentNeeds().catch(console.error);
