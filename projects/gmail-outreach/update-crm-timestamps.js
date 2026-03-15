const { google } = require('googleapis');
const fs = require('fs');

async function updateTimestamps() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const batch = JSON.parse(fs.readFileSync('clean-batch-25-verified.json', 'utf8'));
  
  // Read current Contacts sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A2:I1000'
  });

  const rows = response.data.values || [];
  const timestamp = new Date().toISOString();
  
  // Find rows for each sent email and prepare updates
  const updates = [];
  batch.forEach(contact => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === contact.company && row[4] === contact.email) {
        updates.push({
          range: `Contacts!I${i + 2}`, // Column I (Last Contacted), +2 for header and 0-index
          values: [[timestamp]]
        });
        console.log(`✓ Marking ${contact.name} at ${contact.company} as contacted`);
        break;
      }
    }
  });

  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`\n✅ Updated ${updates.length} timestamps in CRM`);
  } else {
    console.log('⚠️ No matching rows found to update');
  }
}

updateTimestamps().catch(console.error);
