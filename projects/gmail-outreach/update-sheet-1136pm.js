const {google} = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  const key = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read existing sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values || [];
  const needsEnrich = JSON.parse(fs.readFileSync('./enrichment-needs-1136pm.json', 'utf8'));
  
  console.log('=== UPDATING SHEET ===\n');
  
  // Step 1: Move emails from LinkedIn column to Email column (14 firms)
  const emailsToMove = needsEnrich.filter(n => (n.linkedin || '').includes('@'));
  console.log(`Step 1: Moving ${emailsToMove.length} emails from LinkedIn to Email column\n`);
  
  const updates1 = [];
  emailsToMove.forEach(firm => {
    const rowIndex = firm.row;
    // Column E is Email (index 4), Column G is LinkedIn (index 6)
    updates1.push({
      range: `Sheet1!E${rowIndex}`,
      values: [[firm.linkedin]]
    });
    updates1.push({
      range: `Sheet1!G${rowIndex}`,
      values: [['']] // Clear LinkedIn column
    });
    updates1.push({
      range: `Sheet1!J${rowIndex}`,
      values: [['Enriched']]
    });
    console.log(`  Row ${rowIndex}: ${firm.company} -> ${firm.linkedin}`);
  });
  
  // Step 2: Add newly researched email (Emergence Capital)
  console.log('\nStep 2: Adding newly researched contact\n');
  const newFindings = JSON.parse(fs.readFileSync('./enrichment-findings-1136pm.json', 'utf8'));
  const verified = newFindings.filter(f => f.email && f.status === 'Enriched');
  
  verified.forEach(firm => {
    const rowIndex = firm.row;
    updates1.push({
      range: `Sheet1!C${rowIndex}`,
      values: [[firm.contactName]]
    });
    updates1.push({
      range: `Sheet1!D${rowIndex}`,
      values: [[firm.title]]
    });
    updates1.push({
      range: `Sheet1!E${rowIndex}`,
      values: [[firm.email]]
    });
    updates1.push({
      range: `Sheet1!J${rowIndex}`,
      values: [['Enriched']]
    });
    console.log(`  Row ${rowIndex}: ${firm.company}`);
    console.log(`    Contact: ${firm.contactName}`);
    console.log(`    Title: ${firm.title}`);
    console.log(`    Email: ${firm.email}`);
    console.log(`    Source: ${firm.source}`);
  });
  
  // Execute batch update
  if (updates1.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates1
      }
    });
    console.log(`\n✅ Updated ${emailsToMove.length + verified.length} firms in the sheet`);
  }
  
  // Summary
  console.log('\n=== ENRICHMENT SUMMARY ===');
  console.log(`Total enriched: ${emailsToMove.length + verified.length}`);
  console.log(`  - Moved existing emails: ${emailsToMove.length}`);
  console.log(`  - Newly researched: ${verified.length}`);
  console.log(`\nRemaining firms needing research: ${needsEnrich.length - emailsToMove.length - verified.length}`);
}

updateSheet().catch(console.error);
