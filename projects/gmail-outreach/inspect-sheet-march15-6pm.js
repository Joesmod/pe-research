const { google } = require('googleapis');

async function inspectSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // Get basic sheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    console.log('Available sheets/tabs:');
    metadata.data.sheets.forEach(sheet => {
      console.log(`- ${sheet.properties.title} (${sheet.properties.sheetId})`);
    });

    // Read first few rows from Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:Z10',
    });

    console.log('\nFirst 10 rows from Sheet1:');
    response.data.values.forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`, row.slice(0, 8)); // Show first 8 columns
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectSheet();
