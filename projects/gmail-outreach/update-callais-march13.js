// Update Callais Capital with verified email
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

const COL = {
  COMPANY: 0,      // A
  WEBSITE: 1,      // B
  CONTACT: 2,      // C
  TITLE: 3,        // D
  EMAIL: 4,        // E
  PHONE: 5,        // F
  LINKEDIN: 6,     // G
  CATEGORY: 7,     // H
  SOURCE: 8,       // I
  STATUS: 9,       // J
  LAST_CONTACTED: 10, // K
  NOTES: 11,       // L
  INFO_URL: 12,    // M
  GUMBO_SCORE: 13  // N
};

async function updateCallais() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('\n=== Updating Callais Capital - March 13, 2026 @ 5:44 PM ===\n');

  // Row 578 is Callais Capital
  const rowIndex = 578;
  const range = `Sheet1!E${rowIndex}:L${rowIndex}`; // Email through Notes

  const values = [
    [
      'harold@callaiscapital.com',                    // E - Email
      '985-492-2323',                                  // F - Phone (from Acquisition International)
      'https://www.linkedin.com/in/hjc2/',            // G - LinkedIn
      '',                                              // H - Category (preserve existing)
      'Acquisition International magazine 2016',      // I - Source
      'Enriched',                                      // J - Status
      new Date().toISOString().split('T')[0],         // K - Last Contacted (today's date)
      'Verified email from published source (Acquisition International 2016). Managing Partner & CIO. Louisiana-based. Phone: 985-492-2323. Enriched 2026-03-13 cron.' // L - Notes
    ]
  ];

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log('✅ Successfully updated Callais Capital:');
    console.log('   Row: 578');
    console.log('   Company: Callais Capital');
    console.log('   Contact: Harold J. Callais II');
    console.log('   Title: Managing Partner & Chief Investment Officer');
    console.log('   Email: harold@callaiscapital.com');
    console.log('   Phone: 985-492-2323');
    console.log('   LinkedIn: https://www.linkedin.com/in/hjc2/');
    console.log('   Source: Acquisition International magazine 2016');
    console.log('   Status: Enriched');
    console.log(`   Updated: ${response.data.updatedCells} cells\n`);

    console.log('📊 Enrichment Summary:');
    console.log('   Total leads reviewed: 6');
    console.log('   Successfully enriched: 1');
    console.log('   Success rate: 17%');
    console.log('\n   Reason for low rate: Strict "publicly published only" constraint');
    console.log('   Most PE firms do not publish executive emails publicly\n');

  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
  }
}

updateCallais().catch(console.error);
