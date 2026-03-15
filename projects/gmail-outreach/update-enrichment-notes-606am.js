const { google } = require('googleapis');

async function updateNotes() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Get current data to find the Notes column
  const readRes = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: 'Sheet1!A1:Z1'
  });

  const headers = readRes.data.values[0];
  const notesCol = headers.indexOf('Notes');
  const notesColLetter = String.fromCharCode(65 + notesCol); // Convert to letter

  const updates = [
    { row: 39, note: 'No verified public email found (searched 3/9/26). Contact via firm phone: (781) 239-0700' },
    { row: 40, note: 'No verified public email found (searched 3/9/26). Consider LinkedIn outreach.' },
    { row: 494, note: 'High-profile founder. No public email. LinkedIn: linkedin.com/in/jtlonsdale' },
    { row: 700, note: 'No verified public email found (searched 3/9/26). AIP switchboard available.' },
    { row: 880, note: 'Joined Arsenal 2024. No verified public email found (searched 3/9/26).' }
  ];

  console.log('Updating Notes column for 5 contacts...\n');

  for (const update of updates) {
    const range = `Sheet1!${notesColLetter}${update.row}`;
    console.log(`Row ${update.row}: ${update.note}`);
    
    await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [[update.note]]
      }
    });
  }

  console.log('\n✓ Notes updated successfully');
}

updateNotes().catch(console.error);
