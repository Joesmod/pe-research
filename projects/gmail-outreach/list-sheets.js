const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });
    
    console.log('Available sheets:');
    res.data.sheets.forEach(sheet => {
      console.log(`- ${sheet.properties.title}`);
    });
    
    // Try reading the first sheet
    const firstSheet = res.data.sheets[0].properties.title;
    console.log(`\nReading data from: ${firstSheet}`);
    
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${firstSheet}!A:K`
    });
    
    const rows = dataRes.data.values || [];
    console.log(`\nFound ${rows.length} rows`);
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
