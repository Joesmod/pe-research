const { google } = require('googleapis');

async function getRows() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J'
  });

  const rows = res.data.values || [];
  const headers = rows[0];
  
  // Rows we need: 39, 40, 494, 700, 880
  const targetRows = [39, 40, 494, 700, 880];
  
  targetRows.forEach(rowNum => {
    const row = rows[rowNum - 1]; // 0-indexed
    console.log(`\n=== Row ${rowNum} ===`);
    headers.forEach((header, idx) => {
      console.log(`${header}: ${row[idx] || '[EMPTY]'}`);
    });
  });
}

getRows().catch(console.error);
