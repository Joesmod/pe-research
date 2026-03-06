const {google} = require('googleapis');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  
  // Row 419 = KSL Capital Partners
  // Update: Contact Name (C), Title (D), Email (E), LinkedIn (G), Status (J)
  
  const updates = [
    {
      range: 'Sheet1!C419',  // Contact Name
      values: [['Kirk Adamson']]
    },
    {
      range: 'Sheet1!D419',  // Title
      values: [['Partner']]
    },
    {
      range: 'Sheet1!E419',  // Email
      values: [['kirk.adamson@kslcapital.com']]
    },
    {
      range: 'Sheet1!G419',  // LinkedIn
      values: [['https://www.linkedin.com/in/kirk-adamson']]
    },
    {
      range: 'Sheet1!J419',  // Status
      values: [['Enriched']]
    }
  ];
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: update.range,
      valueInputOption: 'RAW',
      requestBody: {
        values: update.values
      }
    });
  }
  
  console.log('✓ Updated KSL Capital Partners (Row 419) with Kirk Adamson contact info');
  console.log('  Email: kirk.adamson@kslcapital.com');
  console.log('  Status: Enriched');
})();
