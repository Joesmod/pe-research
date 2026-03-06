const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function updateMarlinContact() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Row 229: Marlin Equity Partners
  // Update: Contact Name, Email, Notes
  const updates = [
    {
      range: 'Sheet1!C229', // Contact Name
      values: [['Peter Spasov']]
    },
    {
      range: 'Sheet1!D229', // Email
      values: [['pspasov@marlinequity.com']]
    },
    {
      range: 'Sheet1!F229', // Status
      values: [['Enriched']]
    },
    {
      range: 'Sheet1!J229', // Notes
      values: [['Verified from official press release on marlinequity.com (2026-03-06)']]
    }
  ];
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      console.log(`✅ Updated ${update.range}`);
    } catch (error) {
      console.error(`❌ Failed to update ${update.range}:`, error.message);
    }
  }
  
  console.log('\n✅ Marlin Equity Partners contact updated successfully!');
}

updateMarlinContact().catch(console.error);
