const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function applyAdditional() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const updates = JSON.parse(fs.readFileSync('additional-enrichments-march13.json', 'utf8'));

  console.log(`\n🔄 Applying ${updates.length} additional enrichments...\n`);

  for (const update of updates) {
    const { row, company, contact, title, email, linkedin, notes } = update;
    
    const requests = [
      { range: `Sheet1!C${row}`, values: [[contact]] },
      { range: `Sheet1!D${row}`, values: [[title]] },
      { range: `Sheet1!E${row}`, values: [[email]] },
      { range: `Sheet1!F${row}`, values: [[linkedin]] },
      { range: `Sheet1!J${row}`, values: [['Enriched']] },
      { range: `Sheet1!K${row}`, values: [[notes]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: requests
      }
    });

    console.log(`✅ Row ${row}: ${company} → ${contact} (${title})`);
  }

  console.log(`\n✅ Additional ${updates.length} contacts updated!\n`);
}

applyAdditional().catch(console.error);
