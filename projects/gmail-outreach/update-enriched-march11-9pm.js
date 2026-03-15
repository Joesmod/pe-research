const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  // Load enrichment results
  const results = JSON.parse(fs.readFileSync('enrichment-results-march11-9pm.json', 'utf8'));
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Update each enriched row
  for (const result of results) {
    const updates = [
      {
        range: `Sheet1!C${result.rowNum}`, // Contact Name
        values: [[result.contactName]]
      },
      {
        range: `Sheet1!D${result.rowNum}`, // Title
        values: [[result.title]]
      },
      {
        range: `Sheet1!E${result.rowNum}`, // Email
        values: [[result.email]]
      },
      {
        range: `Sheet1!F${result.rowNum}`, // LinkedIn
        values: [[result.linkedin]]
      },
      {
        range: `Sheet1!J${result.rowNum}`, // Status
        values: [['Enriched']]
      },
      {
        range: `Sheet1!K${result.rowNum}`, // Notes
        values: [[result.notes]]
      }
    ];

    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: {
          values: update.values
        }
      });
    }

    console.log(`✅ Updated Row ${result.rowNum}: ${result.company}`);
    console.log(`   Contact: ${result.contactName} (${result.title})`);
    console.log(`   Email: ${result.email}`);
  }

  console.log(`\n✅ Sheet update complete. ${results.length} row(s) updated.`);
}

updateSheet().catch(console.error);
