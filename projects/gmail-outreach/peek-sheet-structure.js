const { google } = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:N15'
  });

  const rows = r.data.values;
  console.log('Headers:', rows[0]);
  console.log('\nSample rows (first 10):');
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i] || [];
    console.log(`\nRow ${i + 1}:`);
    console.log(`  A (Company): ${row[0] || '(empty)'}`);
    console.log(`  B (Website?): ${row[1] || '(empty)'}`);
    console.log(`  C (Contact): ${row[2] || '(empty)'}`);
    console.log(`  D (Title): ${row[3] || '(empty)'}`);
    console.log(`  E (Email): ${row[4] || '(empty)'}`);
    console.log(`  F: ${row[5] || '(empty)'}`);
    console.log(`  G (LinkedIn?): ${row[6] || '(empty)'}`);
    console.log(`  H (Status?): ${row[7] || '(empty)'}`);
  }
})();
