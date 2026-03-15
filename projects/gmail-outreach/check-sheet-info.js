const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function checkSheetInfo() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get spreadsheet metadata
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID
  });
  
  console.log('Sheet tabs:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`  - ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows, ${sheet.properties.gridProperties.columnCount} cols)`);
  });
}

checkSheetInfo().catch(console.error);
