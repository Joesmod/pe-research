const { google } = require('googleapis');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Tracker!A:M',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('Total rows:', rows.length);
  console.log('Headers:', rows[0]);
  console.log('\nFirst 5 data rows:');
  rows.slice(1, 6).forEach((row, idx) => {
    console.log(`\nRow ${idx + 2}:`, row);
  });
}

readSheet().catch(console.error);
