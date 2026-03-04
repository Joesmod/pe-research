const { google } = require('googleapis');

async function listSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get spreadsheet metadata to see sheet names
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  
  console.log('Available sheets:');
  response.data.sheets.forEach(sheet => {
    console.log(`- "${sheet.properties.title}" (ID: ${sheet.properties.sheetId})`);
  });
  
  // Try reading from first sheet
  const firstSheetName = response.data.sheets[0].properties.title;
  console.log(`\nReading from "${firstSheetName}"...`);
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${firstSheetName}'!A1:L10`,
  });
  
  console.log('\nFirst 10 rows:');
  result.data.values.forEach((row, idx) => {
    console.log(`${idx + 1}: ${JSON.stringify(row)}`);
  });
}

listSheets().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
