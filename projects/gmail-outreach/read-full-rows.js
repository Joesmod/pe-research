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
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('Headers:', rows[0]);
  console.log('\nFirst 5 data rows:\n');
  
  for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
    console.log(`\nRow ${i + 1}:`);
    rows[0].forEach((header, idx) => {
      console.log(`  ${header}: ${rows[i][idx] || '(empty)'}`);
    });
  }
  
  console.log('\n\nRows with empty Contact Name or Email:\n');
  let count = 0;
  for (let i = 1; i < rows.length && count < 10; i++) {
    const row = rows[i];
    const contactName = row[2] || '';
    const email = row[4] || '';
    
    if (!contactName || !email) {
      count++;
      console.log(`\nRow ${i + 1}:`);
      rows[0].forEach((header, idx) => {
        console.log(`  ${header}: ${row[idx] || '(empty)'}`);
      });
    }
  }
}

readSheet().catch(console.error);
