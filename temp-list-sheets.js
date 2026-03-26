const { google } = require('googleapis');
const path = require('path');

async function listSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join('C:', 'Users', 'aljen', '.openclaw', 'workspace-jim', 'projects', 'gmail-outreach', 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get spreadsheet metadata
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
  });
  
  console.log('Available sheets:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
  });
  
  // Try reading the first sheet
  const firstSheet = metadata.data.sheets[0].properties.title;
  console.log(`\nReading from sheet: ${firstSheet}`);
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: `${firstSheet}!A:L`
  });
  
  console.log(JSON.stringify(res.data.values, null, 2));
}

listSheets().catch(console.error);
