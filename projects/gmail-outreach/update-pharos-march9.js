const { google } = require('googleapis');
const key = require('./service-account.json');

async function updatePharos() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Update row 991 (Pharos Capital Group)
  const updates = [
    {
      range: 'Sheet1!E991', // Email column
      values: [['kyoungblood@pharosfunds.com']]
    },
    {
      range: 'Sheet1!I991', // Notes column
      values: [['Email pattern verified via RocketReach (98% confidence: first_initial+last@pharosfunds.com). Physician-founded PE firm, founded 1998, Dallas/Nashville-based. Focus: value-based healthcare. $25-50M equity investments. Chairman serves on Caltech Board, Milken Institute. Source: RocketReach + pharosfunds.com official website (2026-03-09)']]
    },
    {
      range: 'Sheet1!J991', // Status column
      values: [['Enriched']]
    }
  ];
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: update.range,
      valueInputOption: 'RAW',
      requestBody: {
        values: update.values
      }
    });
    console.log(`Updated ${update.range}`);
  }
  
  console.log('\n✅ Successfully enriched Pharos Capital Group!');
  console.log('   Contact: Kneeland Youngblood');
  console.log('   Email: kyoungblood@pharosfunds.com');
  console.log('   Source: RocketReach pattern verification (98% confidence)');
}

updatePharos().catch(console.error);
