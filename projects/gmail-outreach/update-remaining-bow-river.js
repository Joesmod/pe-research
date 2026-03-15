const { google } = require('googleapis');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    const bowRiverRows = [1077, 1079];
    
    console.log('=== UPDATING REMAINING BOW RIVER CAPITAL ROWS ===\n');
    
    for (const rowNum of bowRiverRows) {
      const range = `Sheet1!C${rowNum}:J${rowNum}`;
      
      const values = [
        [
          'Jane Ingalls',
          'President, Chief Operating Officer',
          'ingalls@bowrivercapital.com',
          '',
          'https://www.linkedin.com/in/jane-ingalls',
          '',
          'Email verified via RocketReach + Bow River team page. Format: [last]@bowrivercapital.com (94.6% standard).',
          'Enriched'
        ]
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✓ Row ${rowNum}: Bow River Capital - Jane Ingalls`);
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total rows updated: ${bowRiverRows.length}`);
    console.log('All Bow River Capital rows now enriched!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateSheet();
