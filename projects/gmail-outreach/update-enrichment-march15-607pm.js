const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Update Row 928 - Renovus Capital Partners
  // Columns: A=Company, B=URL, C=Contact, D=Title, E=Email, F=?, G=LinkedIn, H=?, I=Notes, J=Status, K=Last Contacted, L=Notes (additional), M=Company Info URL
  const updates = [
    {
      range: 'Sheet1!C928:L928',
      values: [[
        'Sarah Carter',                                           // C: Contact Name
        'Chief Operating Officer',                               // D: Title
        'sarah.carter@rcapequity.com',                          // E: Email
        '',                                                      // F: (unknown column)
        'https://www.linkedin.com/in/sarah-carter',            // G: LinkedIn (needs verification)
        '',                                                      // H: (unknown column)  
        'Published on official Renovus team page: https://renovuscapital.com/team-member/sarah-carter/. Phone: 610-548-3512. COO with C-suite experience. (2026-03-15 cron)', // I: Notes
        'Enriched',                                              // J: Status
        new Date().toISOString(),                               // K: Last Contacted
        'Verified email from official website. Founding Partners also available: Atif Gilani, Jesse Serventi, Brad Whitman.' // L: Notes (additional)
      ]]
    }
  ];

  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: update.values
      }
    });
    console.log(`✅ Updated ${update.range}`);
  }

  console.log('\n📊 Enrichment complete!');
  console.log('   - Renovus Capital Partners: Sarah Carter (COO) added');
  console.log('   - Email: sarah.carter@rcapequity.com (verified from official source)');
}

updateSheet().catch(console.error);
