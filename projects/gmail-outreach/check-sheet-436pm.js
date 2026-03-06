const { google } = require('googleapis');

async function checkSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:M10'
  });
  
  const rows = response.data.values;
  console.log('Headers:', rows[0]);
  console.log('\nFirst 5 data rows:');
  for (let i = 1; i < Math.min(rows.length, 6); i++) {
    console.log(`Row ${i}:`, rows[i]);
  }
  console.log(`\nTotal rows in range: ${rows.length}`);
}

checkSheet().catch(console.error);
