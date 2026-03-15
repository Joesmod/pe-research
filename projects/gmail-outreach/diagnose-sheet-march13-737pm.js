const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function diagnoseSheet() {
  try {
    const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    // Read the first 10 rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:Z10'
    });
    
    const rows = response.data.values;
    console.log('First 10 rows of the sheet:\n');
    rows.forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`, JSON.stringify(row));
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

diagnoseSheet();
