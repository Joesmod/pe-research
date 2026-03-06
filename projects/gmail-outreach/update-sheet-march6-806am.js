const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = require('./service-account.json');

// Oak Street Funding - CONFIRMED from Globe Newswire press release (2019-10-03)
const updates = [
  {
    rowIndex: 768, // Oak Street Funding
    email: 'Rick.dennen@oakstreetfunding.com',
    status: 'Enriched',
    notes: 'Source: Globe Newswire press release (2019-10-03) - Media Contact'
  }
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Updating ${updates.length} rows in the sheet...`);

  for (const update of updates) {
    // Row index is 1-based, add 1 for header row
    const row = update.rowIndex + 1;

    // Email column is E (index 4)
    const emailRange = `Sheet1!E${row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: emailRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[update.email]] }
    });

    // Status column is J (index 9)
    const statusRange = `Sheet1!J${row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: statusRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[update.status]] }
    });

    console.log(`✅ Row ${row}: Updated email and status`);

    // Add note to Notes column if it exists
    if (update.notes) {
      // Get current row to find Notes column
      const rowData = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!A${row}:Z${row}`
      });

      const headers = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A1:Z1'
      });

      const notesIdx = headers.data.values[0].indexOf('Notes');
      if (notesIdx !== -1) {
        const notesCol = String.fromCharCode(65 + notesIdx);
        const notesRange = `Sheet1!${notesCol}${row}`;
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: notesRange,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [[update.notes]] }
        });
        console.log(`✅ Row ${row}: Added note`);
      }
    }
  }

  console.log('\n✅ Sheet update complete!');
}

main().catch(console.error);
