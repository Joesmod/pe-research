const { google } = require('googleapis');

async function listTabs() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
  });
  
  console.log('Available sheets:');
  res.data.sheets.forEach(sheet => {
    console.log(`  - "${sheet.properties.title}"`);
  });
}

listTabs().catch(console.error);
