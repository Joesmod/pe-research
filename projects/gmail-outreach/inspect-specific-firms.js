const { google } = require('googleapis');

async function inspectFirms() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Inspect specific rows that need enrichment
    const rowsToCheck = [131, 191, 192, 378, 380];

    for (const rowNum of rowsToCheck) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Sheet1!A${rowNum}:M${rowNum}`,
      });

      const row = response.data.values[0];
      console.log(`\n=== ROW ${rowNum} ===`);
      console.log(`Company (Col 0): ${row[0] || '(empty)'}`);
      console.log(`URL (Col 1): ${row[1] || '(empty)'}`);
      console.log(`Contact Name (Col 2): ${row[2] || '(empty)'}`);
      console.log(`Title (Col 3): ${row[3] || '(empty)'}`);
      console.log(`Email (Col 4): ${row[4] || '(empty)'}`);
      console.log(`Extra (Col 5): ${row[5] || '(empty)'}`);
      console.log(`LinkedIn (Col 6): ${row[6] || '(empty)'}`);
      console.log(`Status 1 (Col 7): ${row[7] || '(empty)'}`);
      console.log(`Notes (Col 8): ${row[8] || '(empty)'}`);
      console.log(`Status 2 (Col 9): ${row[9] || '(empty)'}`);
      console.log(`Last Contacted (Col 10): ${row[10] || '(empty)'}`);
      console.log(`More Notes (Col 11): ${row[11] || '(empty)'}`);
      console.log(`Info URL (Col 12): ${row[12] || '(empty)'}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectFirms();
