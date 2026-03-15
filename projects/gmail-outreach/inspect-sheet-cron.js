const { google } = require('googleapis');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:Z', // Get more columns to understand structure
  });
  
  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Print header row with column indices
  console.log('=== HEADER ROW ===');
  rows[0].forEach((header, idx) => {
    console.log(`Col ${idx}: ${header}`);
  });
  
  console.log('\n=== FIRST 5 DATA ROWS ===');
  for (let i = 1; i <= 5 && i < rows.length; i++) {
    console.log(`\nRow ${i+1}:`);
    rows[i].forEach((cell, idx) => {
      if (cell) console.log(`  [${idx}] ${rows[0][idx]}: ${cell}`);
    });
  }
  
  // Count rows needing enrichment
  console.log('\n=== ANALYZING ENRICHMENT NEEDS ===');
  let contactCol = -1, emailCol = -1, companyCol = -1, statusCol = -1;
  
  rows[0].forEach((header, idx) => {
    const h = header.toLowerCase();
    if (h.includes('contact') && h.includes('name')) contactCol = idx;
    if (h === 'email' || h.includes('email')) emailCol = idx;
    if (h.includes('company')) companyCol = idx;
    if (h === 'status') statusCol = idx;
  });
  
  console.log(`Company column: ${companyCol}`);
  console.log(`Contact Name column: ${contactCol}`);
  console.log(`Email column: ${emailCol}`);
  console.log(`Status column: ${statusCol}`);
  
  let needsEnrich = 0;
  let enriched = 0;
  let total = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[companyCol] || row[companyCol].trim() === '') continue; // Skip empty companies
    
    total++;
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|admin|investor)@/i);
    const needsEnrichment = !contact || !email || hasGenericEmail;
    
    if (needsEnrichment && status !== 'Enriched') {
      needsEnrich++;
      if (needsEnrich <= 10) {
        console.log(`\nRow ${i+1}: ${row[companyCol]}`);
        console.log(`  Contact: '${contact}'`);
        console.log(`  Email: '${email}'`);
        console.log(`  Status: '${status}'`);
      }
    } else if (status === 'Enriched') {
      enriched++;
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total companies: ${total}`);
  console.log(`Already enriched: ${enriched}`);
  console.log(`Need enrichment: ${needsEnrich}`);
}

inspectSheet().catch(console.error);
