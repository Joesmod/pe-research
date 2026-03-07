const { google } = require('googleapis');
const fs = require('fs');

async function readSheet() {
  const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Tracker!A1:K10'
  });
  
  const rows = response.data.values;
  rows.forEach((row, i) => {
    console.log(`Row ${i+1}:`);
    console.log(`  Name: ${row[0] || ''}`);
    console.log(`  NotebookLM: ${row[1] || ''}`);
    console.log(`  Company: ${row[2] || ''}`);
    console.log(`  LinkedIn: ${row[3] || ''}`);
    console.log(`  Email: ${row[4] || ''}`);
    console.log(`  Source: ${row[5] || ''}`);
    console.log(`  Reply Date: ${row[6] || ''}`);
    console.log(`  Status: ${row[7] || ''}`);
    console.log(`  Notes: ${row[8] || ''}`);
    console.log();
  });
}

readSheet().catch(console.error);
