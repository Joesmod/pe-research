const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const creds = JSON.parse(fs.readFileSync('service-account.json'));

async function checkFirms() {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:M'
  });

  const rows = res.data.values;
  
  console.log('Looking for Patient Square and Vista Equity...\n');
  
  rows.forEach((row, i) => {
    if (row[0] && (row[0].toLowerCase().includes('patient') || row[0].toLowerCase().includes('vista'))) {
      console.log(`Row ${i + 1}: ${row[0]}`);
      console.log(`  Contact: ${row[2] || '(empty)'}`);
      console.log(`  Email: ${row[3] || '(empty)'}`);
      console.log(`  Title: ${row[4] || '(empty)'}`);
      console.log(`  Status: ${row[9] || '(empty)'}`);
      console.log('');
    }
  });
}

checkFirms().catch(console.error);
