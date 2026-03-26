const { google } = require('googleapis');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A580:N610',
  });
  
  const rows = response.data.values;
  
  rows.forEach((row, i) => {
    const rowNum = 580 + i;
    console.log(`\nRow ${rowNum}: ${row[0] || '(empty)'}`);
    console.log(`  Contact: ${row[2] || '(empty)'}`);
    console.log(`  Title: ${row[3] || '(empty)'}`);
    console.log(`  Email: ${row[4] || '(empty)'}`);
    console.log(`  Status: ${row[9] || '(empty)'}`);
    if (row[10]) console.log(`  Notes: ${row[10]}`);
  });
}

run().catch(console.error);
