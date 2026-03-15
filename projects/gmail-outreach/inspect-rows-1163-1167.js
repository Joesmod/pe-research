const { google } = require('googleapis');

async function inspectRows() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1163:N1167',
  });
  
  const rows = response.data.values;
  
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  rows.forEach((row, idx) => {
    const rowNum = 1163 + idx;
    console.log(`\n=== ROW ${rowNum} ===`);
    
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    row.forEach((val, i) => {
      if (val && val.trim() !== '') {
        console.log(`  ${cols[i]}: ${val}`);
      } else {
        console.log(`  ${cols[i]}: (empty)`);
      }
    });
    
    // Handle missing columns
    for (let i = row.length; i < cols.length; i++) {
      console.log(`  ${cols[i]}: (empty)`);
    }
  });
}

inspectRows().catch(console.error);
