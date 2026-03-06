const { google } = require('googleapis');
const path = require('path');

const KEYFILE = path.join(__dirname, 'service-account.json');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:L';

async function peekSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const rows = response.data.values || [];
  const headers = rows[0];

  console.log('SHEET STRUCTURE');
  console.log('===============\n');
  console.log('Headers:', headers);
  console.log('\nFirst 10 data rows:\n');

  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`Row ${i + 1}:`);
    console.log(`  Firm: ${row[0] || '(empty)'}`);
    console.log(`  Contact: ${row[2] || '(empty)'}`);
    console.log(`  Email: ${row[4] || '(empty)'}`);
    console.log(`  Status: ${row[9] || '(empty)'}`);
    console.log();
  }

  // Search for our target firms
  console.log('\nSEARCHING FOR TARGET FIRMS:');
  const targets = ['Norwest', 'Altamont', 'Vistria', 'Edison', 'Renovus'];
  
  targets.forEach(target => {
    const found = rows.slice(1).filter(row => 
      row[0] && row[0].toLowerCase().includes(target.toLowerCase())
    );
    
    if (found.length > 0) {
      console.log(`\n✅ ${target}:`);
      found.forEach((row, idx) => {
        console.log(`   ${idx + 1}. "${row[0]}" - Contact: ${row[2] || 'EMPTY'} - Email: ${row[4] || 'EMPTY'}`);
      });
    } else {
      console.log(`\n❌ ${target}: Not found`);
    }
  });
}

peekSheet().catch(console.error);
