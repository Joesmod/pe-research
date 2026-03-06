const { google } = require('googleapis');
const fs = require('fs');

const enrichments = JSON.parse(fs.readFileSync('enrichment-batch3-march6-144pm.json', 'utf8'));

async function applyEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('Reading current sheet data...\n');
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values || [];
  
  console.log(`Found ${rows.length} rows in sheet\n`);
  console.log('Applying enrichments...\n');
  
  for (const enrichment of enrichments) {
    // Find the row for this firm
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) { // Start at 1 to skip header
      const firmName = rows[i][0] || ''; // Column A (index 0)
      if (firmName.toLowerCase().includes(enrichment.firm.toLowerCase()) || 
          enrichment.firm.toLowerCase().includes(firmName.toLowerCase())) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.log(`⚠️  Could not find row for: ${enrichment.firm}`);
      continue;
    }
    
    // Update the row
    const updates = [];
    
    // Column C: Contact Name
    if (enrichment.contactName) {
      updates.push({
        range: `Sheet1!C${rowIndex}`,
        values: [[enrichment.contactName]]
      });
    }
    
    // Column D: Title
    if (enrichment.title) {
      updates.push({
        range: `Sheet1!D${rowIndex}`,
        values: [[enrichment.title]]
      });
    }
    
    // Column E: Email
    if (enrichment.email) {
      updates.push({
        range: `Sheet1!E${rowIndex}`,
        values: [[enrichment.email]]
      });
    }
    
    // Column G: LinkedIn
    if (enrichment.linkedIn) {
      updates.push({
        range: `Sheet1!G${rowIndex}`,
        values: [[enrichment.linkedIn]]
      });
    }
    
    // Column J: Status
    if (enrichment.status) {
      updates.push({
        range: `Sheet1!J${rowIndex}`,
        values: [[enrichment.status]]
      });
    }
    
    // Column K: Notes
    if (enrichment.notes) {
      updates.push({
        range: `Sheet1!K${rowIndex}`,
        values: [[enrichment.notes]]
      });
    }
    
    // Apply all updates for this row
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: update.values
        }
      });
    }
    
    console.log(`✓ Row ${rowIndex}: ${enrichment.firm} → ${enrichment.contactName} (${enrichment.title})`);
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n✅ All enrichments applied!');
  console.log(`\nTotal enriched: ${enrichments.length} firms`);
}

applyEnrichments().catch(console.error);
