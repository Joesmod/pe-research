const { google } = require('googleapis');

async function readAllSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const sheetNames = ['Contacts', 'Company Intel', 'Knox Lane'];
  
  for (const sheetName of sheetNames) {
    console.log(`\n======= ${sheetName} =======`);
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:K`,
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found.');
      } else {
        console.log(JSON.stringify(rows, null, 2));
      }
    } catch (err) {
      console.error(`Error reading ${sheetName}:`, err.message);
    }
  }
}

readAllSheets().catch(console.error);
