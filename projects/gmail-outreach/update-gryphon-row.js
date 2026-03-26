const { google } = require('googleapis');
const path = require('path');

async function updateGryphonRow() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  const ROW = 1234;
  
  const updates = [
    // Update website to actual website
    { range: `Sheet1!B${ROW}`, values: [['https://www.gryphon-inv.com/']] },
    
    // Add LinkedIn URL
    { range: `Sheet1!G${ROW}`, values: [['https://www.linkedin.com/in/david-andrews-a9163017']] },
    
    // Update notes with research findings
    { range: `Sheet1!I${ROW}`, values: [[
      'No published direct email found. Verified: Founder & Co-CEO. Office: 415-217-7400. Alt contacts: ir@gryphoninvestors.com, businessdevelopment@gryphoninvestors.com. Researched 2026-03-15.'
    ]] },
    
    // Update status to "Manual Research Needed"
    { range: `Sheet1!H${ROW}`, values: [['Manual Research Needed']] }
  ];
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      data: updates,
      valueInputOption: 'USER_ENTERED'
    }
  });
  
  console.log('✅ Updated Row 1234 (Gryphon Investors) with research notes');
  console.log('   - Added website URL');
  console.log('   - Added LinkedIn URL');
  console.log('   - Added detailed notes about contact options');
  console.log('   - Set status to "Manual Research Needed"');
}

updateGryphonRow().catch(console.error);
