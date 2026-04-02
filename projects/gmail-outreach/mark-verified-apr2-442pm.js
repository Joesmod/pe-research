const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[update.value]]
      }
    });
    console.log(`✅ Updated ${update.range}: ${update.value}`);
  }
}

async function main() {
  console.log('🔧 Marking verified contacts as Enriched\n');
  
  // These rows have complete contact info but empty status
  const updates = [
    { range: 'Sheet1!G2', value: 'Enriched' },  // Aldrich Capital Partners
    { range: 'Sheet1!G3', value: 'Enriched' },  // Quad-C Management
    { range: 'Sheet1!G4', value: 'Enriched' },  // Levine Leichtman Capital Partners
    { range: 'Sheet1!G5', value: 'Enriched' },  // Warburg Pincus
    { range: 'Sheet1!G6', value: 'Enriched' },  // Bain Capital Private Equity
    { range: 'Sheet1!G7', value: 'Enriched' },  // Gridiron Capital
    { range: 'Sheet1!G8', value: 'Enriched' },  // Mill Point Capital
    { range: 'Sheet1!G9', value: 'Enriched' },  // Patient Square Capital
    { range: 'Sheet1!G10', value: 'Enriched' }, // Ridgemont Equity Partners
    { range: 'Sheet1!G11', value: 'Enriched' }, // Pine Brook Partners
    { range: 'Sheet1!G12', value: 'Enriched' }, // AEA Investors
    { range: 'Sheet1!G13', value: 'Enriched' }, // CenterOak Partners
    { range: 'Sheet1!G14', value: 'Enriched' }, // Evolution Equity Partners
    { range: 'Sheet1!G15', value: 'Enriched' }, // Star Mountain Capital
    { range: 'Sheet1!G16', value: 'Enriched' }, // Blue Heron Capital
    { range: 'Sheet1!G17', value: 'Enriched' }  // Brookstone Partners
  ];
  
  await updateSheet(updates);
  
  console.log(`\n✅ Marked ${updates.length} rows as Enriched`);
}

main().catch(console.error);
