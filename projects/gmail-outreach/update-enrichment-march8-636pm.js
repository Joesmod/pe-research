const {google} = require('googleapis');
const enrichments = require('./enrichment-updates-march8-636pm.json');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Column mapping: A=Company, B=NotebookLM, C=Contact, D=Title, E=Email, F=Website, G=LinkedIn, H=Sector, I=Portfolio/Notes, J=Status, K=LastContacted
  const updates = [];
  
  for (const item of enrichments) {
    if (!item.row) continue;
    
    const range = `Sheet1!C${item.row}:K${item.row}`;
    const values = [[
      item.contact || '',           // C: Contact Name
      item.title || '',             // D: Title
      item.email || '',             // E: Email
      item.website || '',           // F: Website
      item.linkedin || '',          // G: LinkedIn
      '',                           // H: Sector Focus (leave empty)
      item.notes || '',             // I: Portfolio Companies / Notes
      item.status || '',            // J: Status
      new Date().toISOString()      // K: Last Contacted
    ]];
    
    updates.push({
      range,
      values
    });
  }
  
  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });
  
  console.log(`✅ Updated ${updates.length} rows in the sheet`);
  console.log('\\nUpdated firms:');
  enrichments.forEach(item => {
    if (item.row) {
      console.log(`  Row ${item.row}: ${item.company} → ${item.status} (${item.contact || 'No contact'})`);
    }
  });
}

updateSheet().catch(err => {
  console.error('❌ Error updating sheet:', err.message);
  process.exit(1);
});
