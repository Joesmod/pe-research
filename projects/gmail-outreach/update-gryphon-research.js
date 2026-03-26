const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const COLS = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  EXTRA: 5,
  LINKEDIN: 6,
  STATUS1: 7,
  NOTES: 8,
  STATUS2: 9,
  LAST_CONTACT: 10
};

async function main() {
  console.log('Updating Gryphon Investors row with research findings...\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Row 1234 for Gryphon Investors
  const rowIndex = 1234;
  
  // Data to update
  const updates = [
    {
      range: `Sheet1!I${rowIndex}`,  // Notes column
      values: [['No direct email published on official website. Department contacts: ir@gryphoninvestors.com, businessdevelopment@gryphoninvestors.com. Source: https://www.gryphon-inv.com/contact/ (researched 2026-03-16)']]
    },
    {
      range: `Sheet1!H${rowIndex}`,  // Status1 column
      values: [['Manual Research - No Direct Email']]
    }
  ];
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates,
    },
  });
  
  console.log('✓ Updated Row 1234 (Gryphon Investors)');
  console.log('  - Notes: Research findings documented');
  console.log('  - Status: Manual Research - No Direct Email');
  console.log('\n📋 Finding: R. David Andrews (Founder & Co-CEO) bio confirmed at');
  console.log('   https://www.gryphon-inv.com/team/david-andrews/');
  console.log('   but no direct email published. Only department emails available.');
}

main();
