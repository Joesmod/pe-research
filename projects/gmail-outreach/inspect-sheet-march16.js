const { google } = require('googleapis');

async function inspectSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Read first 10 rows to understand structure
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:M10',
    });

    const rows = response.data.values;
    
    console.log('=== RAW SHEET DATA (First 10 rows) ===\n');
    rows.forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`);
      row.forEach((cell, colIdx) => {
        console.log(`  Col ${colIdx}: ${cell || '(empty)'}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectSheet();
