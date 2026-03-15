const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    // Row 129 is the Pharos Capital Group row
    const rowNumber = 129;
    
    const updates = [
      {
        range: `Sheet1!C${rowNumber}`,  // Contact Name
        values: [['Adam Persiani']]
      },
      {
        range: `Sheet1!D${rowNumber}`,  // Title
        values: [['Managing Director, Business Development']]
      },
      {
        range: `Sheet1!E${rowNumber}`,  // Email
        values: [['apersiani@pharosfunds.com']]
      },
      {
        range: `Sheet1!G${rowNumber}`,  // LinkedIn
        values: [['https://www.linkedin.com/in/adampersiani/']]
      },
      {
        range: `Sheet1!J${rowNumber}`,  // Status
        values: [['Enriched']]
      },
      {
        range: `Sheet1!L${rowNumber}`,  // Notes
        values: [['Source: ContactOut (verified public directory) - March 13, 2026']]
      }
    ];
    
    console.log('Updating Pharos Capital Group (row 129)...\n');
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: update.values
        }
      });
      console.log(`✓ Updated ${update.range}: ${update.values[0][0]}`);
    }
    
    console.log('\n✅ Pharos Capital Group enrichment complete!');
    console.log('\nContact Details:');
    console.log('  Name: Adam Persiani');
    console.log('  Title: Managing Director, Business Development');
    console.log('  Email: apersiani@pharosfunds.com');
    console.log('  LinkedIn: https://www.linkedin.com/in/adampersiani/');
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
  }
})();
