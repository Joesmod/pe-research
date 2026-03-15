const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    const enrichments = JSON.parse(fs.readFileSync('enrichment-updates-march10-136am.json', 'utf8'));

    console.log(`Updating ${enrichments.length} leads in the sheet...\n`);

    for (const enrich of enrichments) {
      const row = enrich.row;
      const updates = enrich.updates;
      
      console.log(`Row ${row}: ${enrich.company}`);
      console.log(`  Contact: ${updates['Contact Name']}`);
      console.log(`  Title: ${updates.Title}`);
      console.log(`  Email: ${updates.Email}`);
      console.log(`  Status: ${updates.Status}`);
      console.log(`  Notes: ${updates.Notes.substring(0, 100)}...`);
      
      // Update specific columns for this row
      // Columns: C=Contact Name, D=Title, E=Email, G=LinkedIn, J=Status, I=Portfolio/Notes
      const updates_batch = [
        {
          range: `Sheet1!C${row}`,
          values: [[updates['Contact Name']]]
        },
        {
          range: `Sheet1!D${row}`,
          values: [[updates.Title]]
        },
        {
          range: `Sheet1!E${row}`,
          values: [[updates.Email]]
        },
        {
          range: `Sheet1!G${row}`,
          values: [[updates.LinkedIn || '']]
        },
        {
          range: `Sheet1!I${row}`,
          values: [[updates.Notes]]
        },
        {
          range: `Sheet1!J${row}`,
          values: [[updates.Status]]
        }
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates_batch
        }
      });

      console.log(`  ✓ Updated\n`);
    }

    console.log(`\nSuccessfully enriched ${enrichments.length} leads!`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

updateSheet();
