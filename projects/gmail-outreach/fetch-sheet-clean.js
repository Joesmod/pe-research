const {google} = require('googleapis');
const fs = require('fs');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  // Write to file properly
  fs.writeFileSync('sheet-data.json', JSON.stringify(rows, null, 2), 'utf8');
  console.log(`✅ Fetched ${rows.length} rows from sheet`);
}

readSheet().catch(console.error);
