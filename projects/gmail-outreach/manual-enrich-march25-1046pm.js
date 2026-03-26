const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Manual research findings for firms not in Apollo
const updates = [
  {
    row: 18,
    company: 'Gryphon Investors',
    contact: 'Keith Stimson',
    linkedin: 'https://www.linkedin.com/in/keith-stimson-69a2a81/',
    notes: 'LinkedIn found. Email domain: @gryphoninvestors.com (verified from careers/compliance pages). Direct email not publicly available. Suggest LinkedIn outreach or general BD contact: businessdevelopment@gryphoninvestors.com'
  },
  {
    row: 36,
    company: 'Cressey & Company',
    contact: 'Bryan Cressey',
    linkedin: 'https://www.linkedin.com/in/bryan-cressey/',
    notes: 'LinkedIn found. Website: cresseyco.com. Direct email not publicly available. Healthcare-focused PE firm, managing partner. Phone: 615-369-8444 (Crunchbase). Suggest LinkedIn outreach.'
  },
  {
    row: 39,
    company: 'Ampersand Capital Partners',
    contact: 'Herb Hooper',
    linkedin: '',  // Will search
    notes: 'Searching for public contact info...'
  },
  {
    row: 55,
    company: 'Clearview Capital',
    contact: 'William Case',
    linkedin: '',
    notes: 'Searching for public contact info...'
  },
  {
    row: 68,
    company: 'Pamlico Capital',
    contact: 'Watts Hamrick',
    linkedin: '',
    notes: 'Searching for public contact info...'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('🫡 Manual Research Updates - March 25, 2026 10:46 PM\n');
  console.log('Updating firms with LinkedIn URLs and research notes...\n');
  
  for (const update of updates.slice(0, 2)) {  // Start with first 2
    console.log(`Updating Row ${update.row}: ${update.company} - ${update.contact}`);
    
    if (update.linkedin) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${update.row}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[update.linkedin]] }
      });
      console.log(`  ✓ LinkedIn added: ${update.linkedin}`);
    }
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${update.row}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[update.notes]] }
    });
    console.log(`  ✓ Notes updated\n`);
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('✅ Manual research updates complete for initial batch.\n');
  console.log('FINDINGS:');
  console.log('- Most mid-market PE firms do not publish individual emails publicly');
  console.log('- LinkedIn profiles are available for most contacts');
  console.log('- Email domains can be verified from company websites');
  console.log('- Recommendation: LinkedIn outreach or use general BD/IR contacts\n');
}

updateSheet().catch(console.error);
