const { google } = require('googleapis');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const updates = [
  { row: 18, firm: 'Gryphon Investors', contact: 'Keith Stimson', linkedin: 'linkedin.com/in/keith-stimson-69a2a81' },
  { row: 36, firm: 'Cressey & Company', contact: 'Bryan Cressey' },
  { row: 39, firm: 'Ampersand Capital Partners', contact: 'Herb Hooper' },
  { row: 55, firm: 'Clearview Capital', contact: 'William Case', correctWebsite: 'https://www.clearviewcp.com' },
  { row: 68, firm: 'Pamlico Capital', contact: 'Watts Hamrick' },
  { row: 135, firm: 'Leeds Equity Partners', contact: 'Jeffrey Leeds' },
  { row: 192, firm: 'NewSpring Capital', contact: 'Michael DiPiano', correctWebsite: 'https://www.newspringcapital.com' },
  { row: 361, firm: 'K1 Investment Management', contact: 'Ron Cano' },
  { row: 375, firm: 'Kinzie Capital Partners LP', contact: 'Suzanne Yoon', correctWebsite: 'https://kinziecapital.com' }
];

async function updateNotes() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const batchUpdates = [];
  
  for (const item of updates) {
    const linkedinNote = item.linkedin ? ` (${item.linkedin})` : '';
    const note = `Apollo API search (2026-03-25 7:46pm): No email found for ${item.contact}. Contact not in Apollo database. MANUAL RESEARCH NEEDED: Check ${item.firm} team page, LinkedIn profile${linkedinNote}, or press releases for verified email address.`;
    
    batchUpdates.push({
      range: `Sheet1!I${item.row}`,
      values: [[note]]
    });
    
    // Fix website data issues
    if (item.correctWebsite) {
      batchUpdates.push({
        range: `Sheet1!B${item.row}`,
        values: [[item.correctWebsite]]
      });
    }
  }
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: batchUpdates
    }
  });
  
  console.log(`✅ Updated ${updates.length} rows with research notes`);
  console.log(`✅ Fixed ${updates.filter(u => u.correctWebsite).length} website data errors`);
}

updateNotes().catch(console.error);
