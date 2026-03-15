const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1';

// Load enrichment results
const enrichmentData = JSON.parse(fs.readFileSync('enrichment-results-706pm-march6.json', 'utf8'));

async function updateSheet() {
  try {
    // Load service account credentials
    const keyPath = path.join(__dirname, 'service-account.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('\n=== UPDATING GOOGLE SHEET ===\n');

    // Process each enriched lead
    for (const lead of enrichmentData) {
      if (!lead.contactName) {
        console.log(`Skipping ${lead.company} - no contact found`);
        continue;
      }

      const row = lead.rowIndex;
      
      // Prepare update data
      const updates = [];
      
      // Column C: Contact Name
      if (lead.contactName) {
        updates.push({
          range: `${RANGE}!C${row}`,
          values: [[lead.contactName]]
        });
      }
      
      // Column D: Title
      if (lead.title) {
        updates.push({
          range: `${RANGE}!D${row}`,
          values: [[lead.title]]
        });
      }
      
      // Column E: Email (only if officially verified)
      if (lead.email) {
        updates.push({
          range: `${RANGE}!E${row}`,
          values: [[lead.email]]
        });
      }
      
      // Column F: LinkedIn
      if (lead.linkedIn) {
        updates.push({
          range: `${RANGE}!F${row}`,
          values: [[lead.linkedIn]]
        });
      }
      
      // Column G: Status
      updates.push({
        range: `${RANGE}!G${row}`,
        values: [[lead.status]]
      });
      
      // Column H: Notes (source + any additional notes)
      const notesText = `Source: ${lead.source}${lead.notes ? ' | ' + lead.notes : ''}`;
      updates.push({
        range: `${RANGE}!H${row}`,
        values: [[notesText]]
      });
      
      // Execute updates
      for (const update of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: update.range,
          valueInputOption: 'RAW',
          requestBody: {
            values: update.values
          }
        });
      }
      
      const emailStatus = lead.email ? `✓ ${lead.email}` : '✗ No verified email';
      console.log(`✓ Updated Row ${row}: ${lead.company}`);
      console.log(`  ${lead.contactName} - ${lead.title}`);
      console.log(`  Email: ${emailStatus}`);
      console.log('');
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('=== UPDATE COMPLETE ===');
    console.log(`Total leads updated: ${enrichmentData.filter(l => l.contactName).length}`);
    console.log(`Fully enriched (with verified email): ${enrichmentData.filter(l => l.email).length}`);
    console.log(`Partially enriched (name/title only): ${enrichmentData.filter(l => l.contactName && !l.email).length}`);

  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

// Run update
updateSheet().catch(console.error);
