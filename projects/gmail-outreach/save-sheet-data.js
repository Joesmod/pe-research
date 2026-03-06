const { google } = require('googleapis');
const fs = require('fs');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });

async function saveSheetData() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values;
  fs.writeFileSync('sheet-data-march5-5am.json', JSON.stringify(rows, null, 2));
  console.log(`Saved ${rows.length} rows to sheet-data-march5-5am.json`);
}

saveSheetData().catch(console.error);
