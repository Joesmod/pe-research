const { google } = require('googleapis');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First get all columns to see what we have
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:Z1000'
  });
  
  const rows = response.data.values;
  console.log('=== SHEET INSPECTION ===\n');
  console.log(`Total rows: ${rows.length}\n`);
  
  // Show headers
  console.log('Headers (first row):');
  rows[0].forEach((header, idx) => {
    console.log(`  Col ${String.fromCharCode(65 + idx)} (${idx}): ${header}`);
  });
  
  console.log('\n=== SAMPLE ROWS (showing first 10 data rows) ===\n');
  
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`Row ${i + 1}:`);
    row.forEach((cell, idx) => {
      if (cell) {
        console.log(`  ${rows[0][idx]}: ${cell.substring(0, 80)}${cell.length > 80 ? '...' : ''}`);
      }
    });
    console.log('');
  }
  
  // Now find rows that need enrichment
  console.log('\n=== ENRICHMENT CANDIDATES ===\n');
  
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0];
    const contact = row[2];
    const email = row[4];
    const website = row[5];
    const linkedin = row[6];
    const status = row[9];
    
    // Skip if no firm name
    if (!firmName) continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    
    const needsWork = !contact || !email || hasGenericEmail;
    const hasWebsite = website && website.startsWith('http');
    
    if (needsWork) {
      needsEnrichment.push({
        row: i + 1,
        firm: firmName,
        contact: contact || 'EMPTY',
        email: email || 'EMPTY',
        website: website || 'EMPTY',
        linkedin: linkedin || 'EMPTY',
        status: status || 'EMPTY',
        hasWebsite: hasWebsite
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  console.log(`Firms WITH website data: ${needsEnrichment.filter(f => f.hasWebsite).length}`);
  console.log(`Firms WITHOUT website data: ${needsEnrichment.filter(f => !f.hasWebsite).length}\n`);
  
  // Show first 15 with websites
  console.log('=== TOP 15 CANDIDATES WITH WEBSITE DATA ===\n');
  const withWebsites = needsEnrichment.filter(f => f.hasWebsite).slice(0, 15);
  
  withWebsites.forEach((f, idx) => {
    console.log(`${idx + 1}. Row ${f.row}: ${f.firm}`);
    console.log(`   Contact: ${f.contact}`);
    console.log(`   Email: ${f.email}`);
    console.log(`   Website: ${f.website}`);
    console.log(`   Status: ${f.status}`);
    console.log('');
  });
}

inspectSheet().catch(console.error);
