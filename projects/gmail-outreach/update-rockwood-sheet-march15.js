const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🫡 Updating Rockwood Equity Partners in Sheet...');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Row 1217 = Rockwood Equity Partners
  // Columns (0-indexed):
  // A(0): Company Name
  // B(1): NotebookLM/Website
  // C(2): Contact Name
  // D(3): Position/Title
  // E(4): Email
  // F(5): misc
  // G(6): LinkedIn URL
  // H(7): misc status
  // I(8): Notes
  // J(9): Status
  // K(10): Last Contacted
  // L(11): Notes

  const updates = [
    {
      range: 'Sheet1!C1217',  // Contact Name
      values: [['Kate Faust']]
    },
    {
      range: 'Sheet1!D1217',  // Position/Title
      values: [['Partner, Business Development']]
    },
    {
      range: 'Sheet1!E1217',  // Email
      values: [['kfaust@rockwoodequity.com']]
    },
    {
      range: 'Sheet1!G1217',  // LinkedIn URL
      values: [['https://www.linkedin.com/in/kate-faust']]
    },
    {
      range: 'Sheet1!I1217',  // Notes
      values: [['Partner, Business Development. Email verified from official Rockwood press releases (BusinessWire + rockwoodequity.com/news). Phone: (216) 278-7070. Alt contact: Joe Merrill (Managing Partner, Denver) jmerrill@rockwoodequity.com (pattern inferred from verified bkeith@rockwoodequity.com). Enriched 2026-03-15 cron.']]
    },
    {
      range: 'Sheet1!J1217',  // Status
      values: [['Enriched']]
    },
  ];

  const batchUpdateRequest = {
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  };

  const result = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
  
  console.log(`✅ Updated ${result.data.totalUpdatedCells} cells`);
  console.log('\nUpdated:');
  console.log('  Company: Rockwood Equity Partners (Row 1217)');
  console.log('  Contact: Kate Faust');
  console.log('  Title: Partner, Business Development');
  console.log('  Email: kfaust@rockwoodequity.com');
  console.log('  Source: Official press releases');
  console.log('  Status: Enriched');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
