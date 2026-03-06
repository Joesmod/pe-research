const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('Current column headers:');
  console.log(rows[0]);
  console.log('\nFirst data row (row 2):');
  console.log(rows[1]);
  
  // Show a few rows to understand the structure
  console.log('\nSample rows:');
  for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
    console.log(`\nRow ${i + 1}:`);
    rows[0].forEach((header, idx) => {
      console.log(`  ${header}: ${rows[i][idx] || 'EMPTY'}`);
    });
  }
}

enrichLeads().catch(console.error);
