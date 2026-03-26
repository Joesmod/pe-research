const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('\n=== Updating Wynnchurch Capital Rows ===\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Wynnchurch Capital - John Hatherly
  // Rows: 325, 734, 851, 920, 921, 922, 923
  const updates = [
    { row: 325 },
    { row: 734 },
    { row: 851 },
    { row: 920 },
    { row: 921 },
    { row: 922 },
    { row: 923 },
  ];
  
  const contactName = 'John Hatherly';
  const title = 'Founder, Managing Partner';
  const email = 'jhatherly@wynnchurch.com';
  const linkedin = 'https://www.linkedin.com/in/john-hatherly-4b772112/';
  const status = 'Enriched';
  const notes = 'Email verified from official Wynnchurch website (https://www.wynnchurch.com/team/hatherly-john) + press releases. Phone: 847.604.6102. (2026-03-15 cron)';
  
  // Column indices (0-based)
  const COL = {
    FIRM: 0,           // A
    NOTEBOOK: 1,       // B
    CONTACT: 2,        // C
    TITLE: 3,          // D
    EMAIL: 4,          // E
    WEBSITE_OR_MISC: 5,// F
    LINKEDIN: 6,       // G
    STATUS1: 7,        // H
    NOTES1: 8,         // I
    STATUS2: 9,        // J
    LAST_CONTACTED: 10,// K
    NOTES2: 11,        // L
    INFO_URL: 12,      // M
    SCORE: 13          // N
  };
  
  for (const update of updates) {
    const rowNum = update.row;
    const range = `Sheet1!C${rowNum}:L${rowNum}`; // C to L
    
    // Prepare the update: Contact (C), Title (D), Email (E), LinkedIn (G), Status (H and J), Notes (I and L)
    const values = [
      [
        contactName,      // C: Contact Name
        title,           // D: Title
        email,           // E: Email
        '',              // F: (skip, keep existing)
        linkedin,        // G: LinkedIn
        status,          // H: Status1
        notes,           // I: Notes1
        status,          // J: Status2
        '',              // K: Last Contacted (keep empty)
        notes            // L: Notes2
      ]
    ];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });
      console.log(`✅ Updated row ${rowNum}: Wynnchurch Capital - John Hatherly`);
    } catch (error) {
      console.error(`❌ Error updating row ${rowNum}:`, error.message);
    }
  }
  
  console.log('\n=== Update Complete ===\n');
  console.log(`Total rows updated: ${updates.length}`);
  console.log(`Firm: Wynnchurch Capital`);
  console.log(`Contact: John Hatherly (${email})`);
  console.log(`Source: Official website + press releases\n`);
}

main().catch(console.error);
