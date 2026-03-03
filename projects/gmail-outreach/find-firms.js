const { google } = require('googleapis');

async function findFirms() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:J',
  });
  
  const rows = result.data.values || [];
  
  ['Cambridge Capital', 'Dorm Room'].forEach(search => {
    rows.forEach((row, i) => {
      if (row[0] && row[0].includes(search)) {
        console.log(`Row ${i + 1}: ${row[0]} | Contact: ${row[1] || 'NONE'} | Email: ${row[3] || 'NONE'} | Status: ${row[8] || 'NONE'}`);
      }
    });
  });
}

findFirms().catch(console.error);
