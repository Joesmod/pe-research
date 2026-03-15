const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  try {
    const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    // Read enriched results
    const enrichedData = JSON.parse(fs.readFileSync('apollo-enriched-contacts-march13-737pm.json', 'utf8'));
    
    console.log(`\n📝 Updating Google Sheet with ${enrichedData.length} enriched contacts\n`);
    
    // Read current sheet to understand structure
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:Z1'
    });
    
    const headers = currentData.data.values[0];
    console.log('Headers:', headers);
    
    // Column indices (0-based)
    // A=0: Company Name
    // B=1: NotebookLM/Website
    // C=2: Contact Name
    // D=3: Position/Title
    // E=4: Email
    // F=5: (unknown)
    // G=6: LinkedIn
    // H=7: (description)
    // I=8: Notes
    // J=9: Status
    
    const updates = [];
    
    for (const result of enrichedData) {
      if (!result.enrichedContact || !result.enrichedContact.email) {
        console.log(`⏭️  Skipping ${result.company} (no email found)`);
        continue;
      }
      
      const contact = result.enrichedContact;
      const rowIndex = result.rowIndex; // 1-indexed
      
      console.log(`\n✅ Updating Row ${rowIndex}: ${result.company}`);
      console.log(`   Name: ${contact.name}`);
      console.log(`   Title: ${contact.title}`);
      console.log(`   Email: ${contact.email}`);
      console.log(`   LinkedIn: ${contact.linkedin || 'N/A'}`);
      
      // Prepare updates for this row
      const range = `Sheet1!C${rowIndex}:J${rowIndex}`;
      const values = [[
        contact.name,                      // C: Contact Name
        contact.title,                     // D: Position/Title
        contact.email,                     // E: Email
        '',                                // F: (unknown)
        contact.linkedin || '',            // G: LinkedIn
        '',                                // H: (description)
        `Apollo API enrichment 2026-03-13`, // I: Notes
        'Enriched'                         // J: Status
      ]];
      
      updates.push({
        range,
        values
      });
    }
    
    if (updates.length === 0) {
      console.log('\n⚠️  No updates to apply');
      return;
    }
    
    // Batch update
    console.log(`\n🚀 Applying ${updates.length} updates to sheet...`);
    
    const batchUpdateResponse = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`\n✅ Successfully updated ${updates.length} rows`);
    console.log(`   Updated cells: ${batchUpdateResponse.data.totalUpdatedCells}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

updateSheet();
