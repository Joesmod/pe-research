const { google } = require('googleapis');

async function listSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  
  console.log('Available sheets:');
  response.data.sheets.forEach(sheet => {
    console.log(`- ${sheet.properties.title}`);
  });
}

listSheets().catch(console.error);
