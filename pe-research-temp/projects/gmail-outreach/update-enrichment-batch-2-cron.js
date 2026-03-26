const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Load enrichment data
  const enrichments = JSON.parse(fs.readFileSync('enrichment-batch-2-cron-2026-03-03.json', 'utf8'));
  
  console.log(`\nUpdating ${enrichments.length} enriched leads (batch 2)...\n`);
  
  for (const lead of enrichments) {
    const row = lead.rowIndex;
    
    // Column mapping: B=Contact Name, C=Title, D=Email, F=LinkedIn, I=Status
    const updates = [];
    
    if (lead.contactName) {
      updates.push({
        range: `Sheet1!B${row}`,
        values: [[lead.contactName]]
      });
    }
    
    if (lead.title) {
      updates.push({
        range: `Sheet1!C${row}`,
        values: [[lead.title]]
      });
    }
    
    if (lead.email) {
      updates.push({
        range: `Sheet1!D${row}`,
        values: [[lead.email]]
      });
    }
    
    if (lead.linkedIn) {
      updates.push({
        range: `Sheet1!F${row}`,
        values: [[lead.linkedIn]]
      });
    }
    
    updates.push({
      range: `Sheet1!I${row}`,
      values: [['Enriched']]
    });
    
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
    
    console.log(`✓ Row ${row}: ${lead.company} - ${lead.contactName} (${lead.email})`);
    console.log(`  Source: ${lead.source}`);
    if (lead.notes) {
      console.log(`  Notes: ${lead.notes}`);
    }
    console.log('');
  }
  
  console.log(`\n✅ Successfully updated ${enrichments.length} more leads`);
}

updateSheet().catch(console.error);
