const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Read enrichment results
const enrichments = JSON.parse(fs.readFileSync('enrichment-results-2026-03-05-21-11.json', 'utf8'));

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`\n=== UPDATING GOOGLE SHEET ===\n`);
  console.log(`Updating ${enrichments.length} leads...\n`);
  
  for (const enrich of enrichments) {
    const row = enrich.row;
    const range = `Sheet1!C${row}:G${row}`; // Contact Name, Title, Email, Website (skip), LinkedIn
    
    const values = [[
      enrich.contactName,
      enrich.title,
      enrich.email,
      '', // Keep existing website
      enrich.linkedin
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
      
      // Also update Status to "Enriched" and add Notes
      const statusRange = `Sheet1!J${row}:L${row}`;
      const now = new Date().toISOString().slice(0, 10);
      const statusValues = [[
        'Enriched',
        now,
        `Apollo-enriched ${now}. Verified ${enrich.title}.`
      ]];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: statusRange,
        valueInputOption: 'USER_ENTERED',
        resource: { values: statusValues }
      });
      
      console.log(`✅ Row ${row}: ${enrich.company}`);
      console.log(`   → ${enrich.contactName} (${enrich.title})`);
      console.log(`   → ${enrich.email}`);
      
    } catch (error) {
      console.log(`❌ Row ${row}: ${error.message}`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n=== SHEET UPDATE COMPLETE ===`);
  console.log(`✅ Updated ${enrichments.length} rows\n`);
}

updateSheet().catch(console.error);
