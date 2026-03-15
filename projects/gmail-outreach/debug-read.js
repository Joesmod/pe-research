// Debug Read
const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function debugRead() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:L10',
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\nFirst row:', response.data.values?.[0]);
    console.log('Second row:', response.data.values?.[1]);
    console.log('Total rows returned:', response.data.values?.length || 0);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugRead();
