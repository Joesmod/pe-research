const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

const updates = [
  {
    rowIndex: 1200,
    company: 'Lightyear Capital',
    contactName: 'Mark Vassallo',
    title: 'Managing Partner',
    email: '', // No verified public email found
    linkedin: 'https://www.linkedin.com/in/mark-vassallo-24213a242/',
    status: 'Researched - No Public Email',
    notes: 'Managing Partner, Member of Investment and Management Committees. Email domain @lycap.com confirmed but specific address not publicly available. Founded 2000, ~$10B AUM, fintech/healthcare focus.'
  },
  {
    rowIndex: 1201,
    company: 'One Equity Partners',
    contactName: 'J.B. Cherry',
    title: 'Partner',
    email: '', // No verified public email found
    linkedin: 'https://www.linkedin.com/in/jb-cherry-8358864/',
    status: 'Researched - No Public Email',
    notes: 'Partner based in Chicago, Member of Investment and Operating Committees. Joined 2003. Email domain @oneequity.com confirmed but specific address not publicly available. Founded 2001, ~$10B AUM, industrials/healthcare/tech.'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of updates) {
    console.log(`\nUpdating Row ${update.rowIndex}: ${update.company}`);
    console.log(`  Contact: ${update.contactName} - ${update.title}`);
    console.log(`  LinkedIn: ${update.linkedin}`);
    console.log(`  Status: ${update.status}`);

    const range = `Sheet1!C${update.rowIndex}:H${update.rowIndex}`;
    const values = [[
      update.contactName,
      update.title,
      update.email,
      '', // Company URL (empty for now)
      update.linkedin,
      update.status
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });

      // Update notes in column I
      const notesRange = `Sheet1!I${update.rowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: notesRange,
        valueInputOption: 'RAW',
        resource: { values: [[update.notes]] }
      });

      console.log(`  ✓ Updated successfully`);
    } catch (error) {
      console.error(`  ✗ Error updating: ${error.message}`);
    }
  }

  console.log('\n✓ All updates complete');
}

updateSheet().catch(console.error);
