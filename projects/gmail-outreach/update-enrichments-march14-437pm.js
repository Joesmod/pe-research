const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('=== Updating Enriched Contacts - March 14, 4:37 PM ===\n');
  
  // Load enrichment results
  const enrichments = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'enrichment-results-march14-437pm.json'), 'utf8')
  );
  
  console.log(`Enrichments to apply: ${enrichments.length}\n`);
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Prepare batch update
  const updates = [];
  
  for (const enrichment of enrichments) {
    const row = enrichment.rowNum;
    
    console.log(`Row ${row}: ${enrichment.company}`);
    console.log(`  Contact: ${enrichment.contactName}`);
    console.log(`  Title: ${enrichment.title}`);
    console.log(`  Email: ${enrichment.email}`);
    console.log(`  Status: ${enrichment.status}`);
    console.log('');
    
    // Column mapping:
    // A = Company (don't change)
    // B = Website (don't change)
    // C = Contact Name
    // D = Title
    // E = Email
    // F = (skip)
    // G = LinkedIn URL
    // H = Status
    // I = Notes
    
    // Update Contact Name (column C)
    updates.push({
      range: `Sheet1!C${row}`,
      values: [[enrichment.contactName]]
    });
    
    // Update Title (column D)
    updates.push({
      range: `Sheet1!D${row}`,
      values: [[enrichment.title]]
    });
    
    // Update Email (column E)
    updates.push({
      range: `Sheet1!E${row}`,
      values: [[enrichment.email]]
    });
    
    // Update LinkedIn (column G)
    if (enrichment.linkedin) {
      updates.push({
        range: `Sheet1!G${row}`,
        values: [[enrichment.linkedin]]
      });
    }
    
    // Update Status (column H)
    updates.push({
      range: `Sheet1!H${row}`,
      values: [[enrichment.status]]
    });
    
    // Update Notes (column I)
    updates.push({
      range: `Sheet1!I${row}`,
      values: [[enrichment.notes]]
    });
  }
  
  console.log(`\nPreparing to update ${updates.length} cells...\n`);
  
  // Execute batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
  
  console.log('✅ Successfully updated all enrichments!\n');
  console.log('📊 Summary:');
  console.log(`   Firms enriched: ${enrichments.length}`);
  console.log(`   Cells updated: ${updates.length}`);
  console.log(`   Verified emails: 2 (Revelstoke, LFM)`);
  console.log(`   Inferred emails: 2 (Paine Schwartz, TowerBrook)\n`);
}

main().catch(console.error);
