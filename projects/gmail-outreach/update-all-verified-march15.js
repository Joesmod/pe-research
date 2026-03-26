const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

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

async function updateRow(sheets, rowNum, contact) {
  const range = `Sheet1!C${rowNum}:L${rowNum}`; // C to L
  
  const values = [
    [
      contact.name,         // C: Contact Name
      contact.title,        // D: Title
      contact.email,        // E: Email
      '',                   // F: (skip)
      contact.linkedin || '',// G: LinkedIn
      'Enriched',           // H: Status1
      contact.notes,        // I: Notes1
      'Enriched',           // J: Status2
      '',                   // K: Last Contacted
      contact.notes         // L: Notes2
    ]
  ];
  
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    console.log(`✅ Row ${rowNum}: ${contact.firm} - ${contact.name} (${contact.email})`);
    return true;
  } catch (error) {
    console.error(`❌ Row ${rowNum} failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n=== Updating All Verified Contacts - March 15 ===\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const updates = [
    // Gryphon Investors - Row 18
    {
      row: 18,
      firm: 'Gryphon Investors',
      name: 'Zack Duloc',
      title: 'Managing Director',
      email: 'duloc@gryphoninvestors.com',
      linkedin: '',
      notes: 'Email verified from official Gryphon press release (https://www.gryphon-inv.com/news/gryphon-junior-capital-makes-second-lien-investment-in-awp-safety/). Managing Director, Gryphon Junior Capital. Alt contact: Nik Kumar (VP) kumar@gryphoninvestors.com. (2026-03-15 cron)'
    },
    // Trivest Partners - Row 57 - Using Tony Hill (Principal, BD - more senior)
    {
      row: 57,
      firm: 'Trivest Partners',
      name: 'Tony Hill',
      title: 'Principal, Business Development',
      email: 'thill@trivest.com',
      linkedin: 'https://www.trivest.com/team/', // Team page
      notes: 'Email verified from official Trivest website (https://www.trivest.com/independently-sponsored-october-2020/). Principal, BD. Alt contact: Chris Berton (Paralegal) cberton@trivest.com. Main phone: 305-858-2200. (2026-03-15 cron)'
    },
  ];
  
  let successCount = 0;
  
  for (const update of updates) {
    const success = await updateRow(sheets, update.row, update);
    if (success) successCount++;
  }
  
  console.log(`\n=== Update Summary ===`);
  console.log(`Total updates attempted: ${updates.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${updates.length - successCount}\n`);
  
  console.log('Firms enriched:');
  console.log('- Gryphon Investors (Zack Duloc, MD)');
  console.log('- Trivest Partners (Tony Hill, Principal BD)\n');
}

main().catch(console.error);
