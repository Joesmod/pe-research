const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateHarkness() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Row 276: Harkness Capital Partners
  // Update: Contact Name (C), Title (D), LinkedIn (G), Status (J), Notes (L)
  const updates = [
    {
      range: 'Sheet1!C276',
      values: [['Ian Handsman']]
    },
    {
      range: 'Sheet1!D276',
      values: [['Partner']]
    },
    {
      range: 'Sheet1!G276',
      values: [['https://www.linkedin.com/in/ian-handsman-0181b311']]
    },
    {
      range: 'Sheet1!J276',
      values: [['Enriched']]
    },
    {
      range: 'Sheet1!L276',
      values: [['Partner at Harkness Capital. Verified from company website. Email ihandsman@harknesscapital.com confirmed. 2026-03-11 enrichment.']]
    }
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });

  console.log('✅ Updated Row 276: Ian Handsman @ Harkness Capital Partners');
  console.log('   Contact: Ian Handsman');
  console.log('   Title: Partner');
  console.log('   Email: ihandsman@harknesscapital.com (already in sheet)');
  console.log('   LinkedIn: https://www.linkedin.com/in/ian-handsman-0181b311');
  console.log('   Status: Enriched');
}

updateHarkness().catch(console.error);
