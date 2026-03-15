const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const ENRICHMENTS_PATH = path.join(__dirname, 'enrichment-results-march14-107pm.json');

async function main() {
  // Load enrichments
  const enrichments = JSON.parse(fs.readFileSync(ENRICHMENTS_PATH, 'utf8'));
  
  console.log(`\n=== UPDATING ${enrichments.length} ENRICHMENTS ===\n`);
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Prepare batch update
  const updates = [];
  
  for (const item of enrichments) {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  → ${item.contact} (${item.title})`);
    console.log(`  → ${item.email}`);
    console.log(`  → ${item.linkedin}`);
    console.log('');
    
    // Update columns for this row:
    // C = Contact Name
    // D = Title
    // E = Email
    // G = LinkedIn
    // H = Status
    // I = Notes/Source
    // L = Additional Notes
    
    updates.push({
      range: `Sheet1!C${item.row}`,
      values: [[item.contact]],
    });
    
    updates.push({
      range: `Sheet1!D${item.row}`,
      values: [[item.title]],
    });
    
    updates.push({
      range: `Sheet1!E${item.row}`,
      values: [[item.email]],
    });
    
    updates.push({
      range: `Sheet1!G${item.row}`,
      values: [[item.linkedin]],
    });
    
    updates.push({
      range: `Sheet1!H${item.row}`,
      values: [['Enriched']],
    });
    
    updates.push({
      range: `Sheet1!I${item.row}`,
      values: [[item.source]],
    });
    
    updates.push({
      range: `Sheet1!L${item.row}`,
      values: [[item.notes]],
    });
  }
  
  // Execute batch update
  const batchUpdateRequest = {
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: updates,
    },
  };
  
  const result = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
  
  console.log(`\n✅ Successfully updated ${enrichments.length} rows in the sheet.`);
  console.log(`Total cells updated: ${result.data.totalUpdatedCells}`);
  console.log(`\nEnrichment summary:`);
  enrichments.forEach(item => {
    console.log(`  - ${item.company}: ${item.contact} (${item.email})`);
  });
}

main().catch(console.error);
