const { google } = require('googleapis');
const fs = require('fs');
const key = require('./service-account.json');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read enrichment results
  const results = JSON.parse(fs.readFileSync('apollo-enrichment-FIXED-2026-03-10T03-09-08-034Z.json', 'utf-8'));
  
  const enriched = results.filter(r => r.email && r.email.length > 0);
  
  console.log(`📊 Updating ${enriched.length} enriched leads in Google Sheet...`);
  
  for (const lead of enriched) {
    const row = lead.rowIndex + 1; // Google Sheets is 1-indexed, header is row 1
    
    console.log(`\n✏️  Updating Row ${row}: ${lead.firm}`);
    console.log(`   ${lead.contactName} - ${lead.title}`);
    console.log(`   📧 ${lead.email}`);
    
    const values = [
      [
        lead.contactName,      // Column D: Contact Name
        lead.title,            // Column E: Title
        lead.email,            // Column F: Email
        lead.linkedIn,         // Column G: LinkedIn URL
        'Enriched'             // Column H: Status
      ]
    ];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Sheet1!D${row}:H${row}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
      
      console.log(`   ✅ Updated successfully`);
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Error updating row ${row}:`, error.message);
    }
  }
  
  console.log(`\n✅ Sheet update complete!`);
  console.log(`📊 ${enriched.length} leads enriched and updated`);
}

updateSheet().catch(console.error);
