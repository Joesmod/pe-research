const {google} = require('googleapis');
const enrichments = require('./enrichment-updates-batch2-march8.json');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [];
  
  for (const item of enrichments) {
    if (!item.row) continue;
    
    const range = `Sheet1!C${item.row}:K${item.row}`;
    const values = [[
      item.contact || '',
      item.title || '',
      item.email || '',
      item.website || '',
      item.linkedin || '',
      '',
      item.notes || '',
      item.status || '',
      new Date().toISOString()
    ]];
    
    updates.push({
      range,
      values
    });
  }
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });
  
  console.log(`✅ Batch 2: Updated ${updates.length} rows`);
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
