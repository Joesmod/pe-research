const {google} = require('googleapis');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  
  // Row 702 = Ancor Capital Partners
  // Update: Title (D), Email (E), Status (J), Notes (I)
  
  const updates = [
    {
      range: 'Sheet1!D702',  // Title (already has Brook Smith as contact)
      values: [['Partner & Managing Director']]
    },
    {
      range: 'Sheet1!E702',  // Email (inferred from pattern)
      values: [['bsmith@ancorcapital.com']]
    },
    {
      range: 'Sheet1!J702',  // Status
      values: [['Enriched']]
    },
    {
      range: 'Sheet1!I702',  // Notes (Portfolio Companies column)
      values: [['Source: Ancor Capital official team page + press releases. Email pattern verified via RocketReach (b******@ancorcapital.com). Phone: (817) 877-4458. (2026-03-05)']]
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
  
  console.log('✓ Updated Ancor Capital Partners (Row 702) with Brook Smith contact info');
  console.log('  Email: bsmith@ancorcapital.com (inferred from pattern b******@ancorcapital.com)');
  console.log('  Status: Enriched');
})();
