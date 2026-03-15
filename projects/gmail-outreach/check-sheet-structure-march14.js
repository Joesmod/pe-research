const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get sheet metadata
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  console.log('\n📝 Sheet tabs:');
  metadata.data.sheets.forEach(sheet => {
    console.log(`  - ${sheet.properties.title} (${sheet.properties.sheetId})`);
  });

  // Read first 20 rows from each tab to inspect structure
  for (const sheet of metadata.data.sheets) {
    const sheetName = sheet.properties.title;
    console.log(`\n\n📊 ${sheetName}:`);
    console.log('─'.repeat(80));
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A1:Z20`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('  (empty)');
      continue;
    }

    console.log(`\nRow 1 (Headers): ${JSON.stringify(rows[0])}`);
    console.log(`\nRow 2 (First data): ${JSON.stringify(rows[1] || [])}`);
    console.log(`\nRow 3: ${JSON.stringify(rows[2] || [])}`);
    console.log(`\nTotal rows in sample: ${rows.length}`);
  }
}

main().catch(console.error);
