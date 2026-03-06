const { google } = require('googleapis');
const key = require('./service-account.json');
const enrichments = require('./enrichment-batch-march5-11am.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateEnrichments() {
  try {
    console.log(`Updating ${enrichments.length} enrichments...`);
    
    const updates = [];
    
    for (const enrich of enrichments) {
      const rowNum = enrich.rowIndex + 1; // Convert 0-based to 1-based
      
      // Update Contact Name (Column C)
      updates.push({
        range: `Sheet1!C${rowNum}`,
        values: [[enrich.contactName]]
      });
      
      // Update Title (Column D)
      updates.push({
        range: `Sheet1!D${rowNum}`,
        values: [[enrich.title]]
      });
      
      // Update Email (Column E)
      updates.push({
        range: `Sheet1!E${rowNum}`,
        values: [[enrich.email]]
      });
      
      // Update LinkedIn (Column G)
      if (enrich.linkedin) {
        updates.push({
          range: `Sheet1!G${rowNum}`,
          values: [[enrich.linkedin]]
        });
      }
      
      // Update Portfolio Companies / Notes (Column I)
      if (enrich.notes) {
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [[enrich.notes]]
        });
      }
      
      // Update Status (Column J)
      updates.push({
        range: `Sheet1!J${rowNum}`,
        values: [[enrich.status]]
      });
      
      console.log(`  ✓ ${enrich.company} → ${enrich.contactName} (${enrich.email})`);
    }
    
    // Batch update all at once
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      console.log(`\n✅ Successfully updated ${enrichments.length} firms in Google Sheet`);
      console.log(`\nSummary:`);
      enrichments.forEach(e => {
        console.log(`  • ${e.company}: ${e.contactName} (${e.title}) - ${e.email}`);
      });
    } else {
      console.log('No updates to apply.');
    }
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateEnrichments();
