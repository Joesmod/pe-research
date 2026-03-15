const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read Sheet1 - let's understand the structure
  console.log('=== Reading Sheet1 ===');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z20',
  });

  const rows = response.data.values || [];
  console.log(`Total rows read: ${rows.length}\n`);
  
  // Print first 5 rows with column labels
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    console.log(`\n=== Row ${i} ===`);
    const row = rows[i];
    row.forEach((cell, idx) => {
      const col = String.fromCharCode(65 + idx);
      console.log(`  ${col}: ${cell || '(empty)'}`);
    });
  }

  // Now let's analyze what looks like a header
  // Looking at the data, it seems like the structure might be:
  // Each row represents a PE firm
  // The "Company Name" in column A is consistent across rows
  
  // Let's look for rows that need enrichment (empty Contact Name or generic Email)
  console.log('\n\n=== Analyzing enrichment needs ===');
  
  // Based on the debug output, it looks like:
  // Column A = Company Name
  // Column C = Contact Name  
  // Column D = Position/Title
  // Column E = Email
  // Column F = Company website
  // Column G = LinkedIn URL
  // Column H = Status (or maybe notes?)
  // Column I = Notes
  // Column J = Status (actual)
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {  // Skip row 0 if it's headers
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';  // Column J
    
    // Skip if no company name
    if (!company.trim()) continue;
    
    // Skip if Dead/Bounced
    if (status === 'Dead' || status === 'Bounced') continue;
    
    // Check if needs enrichment
    const hasValidContact = contactName.trim() !== '';
    const hasValidEmail = email.trim() !== '' && 
                          !email.includes('info@') && 
                          !email.includes('sales@') && 
                          !email.includes('ir@') &&
                          !email.includes('contact@');
    
    if (!hasValidContact || !hasValidEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,  // Sheet rows are 1-indexed
        company,
        contactName,
        email,
        status,
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);
  console.log('First 15:');
  needsEnrichment.slice(0, 15).forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.company} (Row ${item.rowIndex}) - Contact: "${item.contactName}" | Email: "${item.email}"`);
  });
  
  // Save to file
  const outputFile = path.join(__dirname, 'enrichment-targets-march15-proper.json');
  fs.writeFileSync(outputFile, JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
  console.log(`\nTargets saved to: ${outputFile}`);
}

main();
