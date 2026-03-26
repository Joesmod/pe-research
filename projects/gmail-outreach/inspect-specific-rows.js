const { google } = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get specific rows that were flagged
  const targetRows = [208, 261, 282, 283, 300, 306, 307];
  
  for (const rowNum of targetRows) {
    const range = `Sheet1!A${rowNum}:N${rowNum}`;
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range
    });
    
    const row = (r.data.values && r.data.values[0]) || [];
    console.log(`\n=== Row ${rowNum} ===`);
    console.log(`Company (A): ${row[0] || '(empty)'}`);
    console.log(`Column B: ${row[1] || '(empty)'}`);
    console.log(`Contact (C): ${row[2] || '(empty)'}`);
    console.log(`Title (D): ${row[3] || '(empty)'}`);
    console.log(`Email (E): ${row[4] || '(empty)'}`);
    console.log(`Column F: ${row[5] || '(empty)'}`);
    console.log(`LinkedIn (G): ${row[6] || '(empty)'}`);
    console.log(`Status (H): ${row[7] || '(empty)'}`);
    console.log(`Notes (I): ${row[8] || '(empty)'}`);
  }
})();
