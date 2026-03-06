const { google } = require('googleapis');

async function findCompanies() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('Reading Sheet1...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log(`\nSearching for Charlesbank or Knox Lane in ${rows.length} companies...\n`);
  
  rows.forEach((row, idx) => {
    const company = (row[0] || '').toLowerCase();
    if (company.includes('charles') || company.includes('knox')) {
      console.log(`Row ${idx + 1}: "${row[0]}"`);
    }
  });
}

findCompanies().catch(console.error);
