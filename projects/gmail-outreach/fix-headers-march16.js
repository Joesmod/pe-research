const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // First, let's see what tabs exist
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  
  console.log('📋 Available sheets/tabs:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`  - ${sheet.properties.title} (${sheet.properties.sheetId})`);
  });
  
  // Read from each tab to find the right one
  for (const sheet of metadata.data.sheets) {
    const tabName = sheet.properties.title;
    console.log(`\n🔍 Reading ${tabName}...`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A1:N5`,
    });
    
    const rows = response.data.values || [];
    console.log(`First row (supposed headers):`, rows[0]);
    if (rows.length > 1) {
      console.log(`Second row:`, rows[1]?.slice(0, 5));
    }
  }
}

run().catch(console.error);
