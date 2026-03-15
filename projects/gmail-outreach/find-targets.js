const { google } = require('googleapis');

async function findTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = result.data.values;
  const targets = ['Warburg Pincus', 'Revelstoke', 'Rockwood', 'LFM Capital'];
  
  console.log('Header:', rows[0]);
  console.log('\nTarget rows:');
  
  for (let i = 1; i < rows.length; i++) {
    if (targets.some(t => rows[i][0] && rows[i][0].includes(t))) {
      console.log(`\nRow ${i+1} (${rows[i][0]}):`);
      console.log('  Contact:', rows[i][2] || 'EMPTY');
      console.log('  Title:', rows[i][3] || 'EMPTY');
      console.log('  Email:', rows[i][4] || 'EMPTY');
      console.log('  Status:', rows[i][7] || 'EMPTY');
    }
  }
}

findTargets().catch(console.error);
