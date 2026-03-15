const { google } = require('googleapis');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Print header
  console.log('HEADER:', rows[0].join(' | '));
  console.log('---');
  
  // Print all rows with row numbers
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    console.log(`Row ${i+1}:`, row.join(' | '));
  }
}

readSheet().catch(console.error);
