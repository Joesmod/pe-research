const { google } = require('googleapis');
const path = require('path');

async function finalUpdate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'projects/gmail-outreach/service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Verified enrichments from research
  const updates = [
    // Row 727 - Roark Capital (verified from official website team page)
    { 
      row: 727, 
      contact: 'Neal Aronson', 
      title: 'Founder and Managing Partner', 
      email: 'naronson@roarkcapital.com',
      linkedIn: 'https://www.linkedin.com/in/neal-aronson/',
      status: 'Enriched',
      notes: 'Source: Roark Capital official team page (verified)'
    },
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
  
  console.log('Final enrichment complete - ' + updates.length + ' leads verified and updated');
  return updates.length;
}

finalUpdate().then(count => {
  console.log('Total enriched: ' + count);
}).catch(console.error);
