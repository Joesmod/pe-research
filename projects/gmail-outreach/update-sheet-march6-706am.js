const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const enrichments = JSON.parse(fs.readFileSync('enrichment-batch-march6-706am.json', 'utf8'));

async function updateSheet() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`Updating ${enrichments.length} leads in sheet...\n`);
  
  for (const lead of enrichments) {
    const { rowIndex, company, contact, title, email, linkedin, source, notes } = lead;
    
    // Row index in the JSON is 0-based from data, need to add 1 for header
    const sheetRow = rowIndex + 1;
    
    console.log(`Updating row ${sheetRow}: ${company} -> ${contact}`);
    
    const updates = [];
    
    // Column C: Contact Name (index 2)
    if (contact) {
      updates.push({
        range: `Sheet1!C${sheetRow}`,
        values: [[contact]]
      });
    }
    
    // Column D: Title (index 3)
    if (title) {
      updates.push({
        range: `Sheet1!D${sheetRow}`,
        values: [[title]]
      });
    }
    
    // Column E: Email (index 4) - leave empty if not found
    // Don't update if empty
    
    // Column G: LinkedIn (index 6)
    if (linkedin) {
      updates.push({
        range: `Sheet1!G${sheetRow}`,
        values: [[linkedin]]
      });
    }
    
    // Column J: Status (index 9)
    updates.push({
      range: `Sheet1!J${sheetRow}`,
      values: [['Partial - LinkedIn Only']]
    });
    
    // Column K: Last Contacted (index 10)
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Combined notes for Portfolio Companies column (index 8)
    const combinedNotes = `${notes}`;
    updates.push({
      range: `Sheet1!I${sheetRow}`,
      values: [[combinedNotes]]
    });
    
    // Batch update
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      console.log(`  ✅ Updated ${updates.length} cells`);
    }
  }
  
  console.log(`\n✅ Sheet update complete!`);
  console.log(`Updated ${enrichments.length} leads with verified contacts and LinkedIn URLs.`);
  console.log(`Note: Email addresses were not found in published sources for these firms.`);
}

updateSheet().catch(console.error);
