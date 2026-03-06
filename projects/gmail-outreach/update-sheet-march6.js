const { google } = require('googleapis');
const fs = require('fs');

const results = JSON.parse(fs.readFileSync('manual-enrichment-results-march6.json', 'utf8'));

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('Updating Google Sheet with enrichment results...\n');
  
  for (const result of results) {
    const row = result.row;
    
    // Determine what to update based on firm type
    let status = result.status || '';
    let notes = result.notes || '';
    
    if (result.firmType !== 'Private Equity' && result.firmType !== 'Private Equity (Fund of Funds)') {
      status = 'Dead';
      notes = `NOT PE FIRM - ${result.firmType}. ${notes}`;
    }
    
    const updates = [];
    
    // Column C: Contact Name (index 2)
    if (result.contactName) {
      updates.push({
        range: `Sheet1!C${row}`,
        values: [[result.contactName]]
      });
    }
    
    // Column D: Title (index 3)
    if (result.title) {
      updates.push({
        range: `Sheet1!D${row}`,
        values: [[result.title]]
      });
    }
    
    // Column E: Email (index 4)
    if (result.email) {
      updates.push({
        range: `Sheet1!E${row}`,
        values: [[result.email]]
      });
    }
    
    // Column G: LinkedIn (index 6)
    if (result.linkedIn) {
      updates.push({
        range: `Sheet1!G${row}`,
        values: [[result.linkedIn]]
      });
    }
    
    // Column J: Status (index 9)
    if (status) {
      updates.push({
        range: `Sheet1!J${row}`,
        values: [[status]]
      });
    }
    
    // Column K: Notes (assuming it exists - index 10)
    if (notes) {
      updates.push({
        range: `Sheet1!K${row}`,
        values: [[notes]]
      });
    }
    
    if (updates.length > 0) {
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
      
      console.log(`✓ Row ${row} (${result.firm}) - ${status || result.firmType}`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n✅ Sheet updated successfully!');
  console.log(`\nSummary:`);
  console.log(`- Total processed: ${results.length}`);
  console.log(`- Actual PE firms: ${results.filter(r => r.firmType.includes('Private Equity')).length}`);
  console.log(`- Non-PE (marked Dead): ${results.filter(r => !r.firmType.includes('Private Equity') && r.firmType !== 'Unknown').length}`);
}

updateSheet().catch(console.error);
