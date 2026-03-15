const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Contacts!A1:Z1';

async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync('service-account.json'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

async function checkColumns() {
  try {
    const authClient = await authenticate();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const headers = response.data.values[0];
    console.log('Columns in sheet:');
    headers.forEach((header, idx) => {
      const letter = String.fromCharCode(65 + idx);
      console.log(`${letter} (${idx}): ${header}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkColumns();
