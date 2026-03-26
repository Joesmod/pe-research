/**
 * Update enriched contacts - March 16, 2026 9:07 PM
 * Manual research results
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const COL = {
  COMPANY: 0,
  SCORE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  EMAIL_STATUS: 5,
  LINKEDIN: 6,
  NOTES: 7,
};

async function updateContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Manual research results
  const updates = [
    {
      row: 1855,
      company: 'Trivest Partners',
      contact: 'Troy Templeton',
      email: 'ttempleton@trivest.com',
      emailStatus: 'verified',
      title: 'Chairman Emeritus',
      linkedin: 'https://www.linkedin.com/in/troy-templeton/',
      notes: 'Email verified via ContactOut. Chairman Emeritus per team page. (2026-03-16 manual research)',
    },
  ];
  
  console.log(`📝 Updating ${updates.length} contacts...\n`);
  
  for (const update of updates) {
    console.log(`Row ${update.row}: ${update.company} - ${update.contact}`);
    console.log(`  Email: ${update.email}`);
    
    // Build the row update
    const rowData = [];
    rowData[COL.COMPANY] = update.company;
    rowData[COL.CONTACT] = update.contact;
    rowData[COL.TITLE] = update.title;
    rowData[COL.EMAIL] = update.email;
    rowData[COL.EMAIL_STATUS] = update.emailStatus;
    rowData[COL.LINKEDIN] = update.linkedin || '';
    rowData[COL.NOTES] = update.notes;
    
    // Pad array to ensure all columns are filled
    while (rowData.length < 10) {
      rowData.push('');
    }
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: CRM_SHEET_ID,
      range: `Contacts!A${update.row}:J${update.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });
    
    console.log(`  ✅ Updated\n`);
  }
  
  console.log(`\n📊 RESEARCH NOTES:\n`);
  console.log(`✅ Trivest Partners - Troy Templeton`);
  console.log(`   Email: ttempleton@trivest.com (verified via ContactOut)`);
  console.log(`   LinkedIn: https://www.linkedin.com/in/troy-templeton/`);
  console.log(`   Title: Chairman Emeritus`);
  console.log(``);
  console.log(`⚠️  Hughes & Company - Travis Hughes`);
  console.log(`   No verified email found. RocketReach shows partial t******@hughes-co.com`);
  console.log(`   Cannot infer full email per instructions (no guessing).`);
  console.log(`   LinkedIn: https://www.linkedin.com/in/travis-hughes-550174/`);
  console.log(`   Title: Managing Partner & Founder`);
  console.log(``);
  console.log(`⚠️  Trivest Partners - Jamie Elias`);
  console.log(`   No verified work email found.`);
  console.log(`   RocketReach shows j******@mba1997.hbs.edu (alumni email, not work)`);
  console.log(`   Cannot infer Trivest email per instructions (no guessing).`);
  console.log(`   LinkedIn: https://www.linkedin.com/in/jamie-elias/`);
  console.log(`   Title: Managing Partner, General Counsel`);
  
  console.log(`\n✅ Manual enrichment complete: 1 contact updated, 2 need further research`);
}

updateContacts().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
