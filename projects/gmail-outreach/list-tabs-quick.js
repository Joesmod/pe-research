const { google } = require('googleapis');

async function listTabs() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
  });
  
  const sheetNames = response.data.sheets.map(s => s.properties.title);
  console.log(JSON.stringify(sheetNames, null, 2));
}

listTabs().catch(console.error);
