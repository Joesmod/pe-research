const { google } = require('googleapis');
const path = require('path');

async function batchUpdate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'projects/gmail-outreach/service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Updates based on research (row number, company, contact, title, email, linkedIn, notes)
  const updates = [
    // Wall Street Oasis - not a PE firm
    { row: 690, status: 'Dead - Not PE Firm', notes: 'Online community for finance professionals, not a PE investor' },
    
    // Wall Street Prep - not a PE firm
    { row: 691, status: 'Dead - Not PE Firm', notes: 'Financial modeling training company, not a PE investor' },
    
    // Wefunder - not a PE firm
    { row: 692, status: 'Dead - Not PE Firm', notes: 'Equity crowdfunding platform, not a PE firm' },
    
    // Yellow Wood Partners (already enriched row 693)
    // Yellowstone Capital Partners (already enriched row 694)
    // 3 Rivers Capital (already enriched row 695)
    
    // 3G Capital - Co-Managing Partners identified but no verified email
    { row: 696, contact: 'Alex Behring', title: 'Co-Founder & Co-Managing Partner', linkedIn: 'https://www.linkedin.com/in/alex-behring-72678424/', status: 'Partial', notes: '3G Capital co-led by Alex Behring & Daniel Schwartz. No public email verified from official sources.' },
  ];
  
  const batchData = [];
  
  for (const update of updates) {
    if (update.contact) {
      batchData.push({
        range: `C${update.row}`,
        values: [[update.contact]]
      });
    }
    
    if (update.title) {
      batchData.push({
        range: `D${update.row}`,
        values: [[update.title]]
      });
    }
    
    if (update.email) {
      batchData.push({
        range: `E${update.row}`,
        values: [[update.email]]
      });
    }
    
    if (update.linkedIn) {
      batchData.push({
        range: `G${update.row}`,
        values: [[update.linkedIn]]
      });
    }
    
    if (update.notes) {
      batchData.push({
        range: `I${update.row}`,
        values: [[update.notes]]
      });
    }
    
    if (update.status) {
      batchData.push({
        range: `J${update.row}`,
        values: [[update.status]]
      });
    }
  }
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: batchData,
      valueInputOption: 'RAW'
    }
  });
  
  console.log('Batch update complete - ' + updates.length + ' leads processed');
}

batchUpdate().catch(console.error);
