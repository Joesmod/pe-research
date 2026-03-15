const { google } = require('googleapis');
const fs = require('fs');

async function update48Contacts() {
  // Load audit results
  const audit = JSON.parse(fs.readFileSync('crm-audit-results.json'));
  const needsUpdate = audit.needsUpdate;
  
  console.log(`Updating ${needsUpdate.length} CRM contacts...\n`);
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  let updated = 0;
  let failed = 0;
  
  for (const item of needsUpdate) {
    const row = item.crm.row;
    const sentDate = new Date(item.sent.date).toISOString();
    
    try {
      // Update Status (column J) to "Contacted"
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!J${row}`,
        valueInputOption: 'RAW',
        resource: { values: [['Contacted']] }
      });
      
      // Update Last Contacted (column K) with timestamp
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!K${row}`,
        valueInputOption: 'RAW',
        resource: { values: [[sentDate]] }
      });
      
      updated++;
      console.log(`✅ ${updated}/${needsUpdate.length}: Row ${row} - ${item.crm.company}`);
      
      // Rate limit: wait 100ms between updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      failed++;
      console.log(`❌ Row ${row} - ${item.crm.company}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Updated ${updated} contacts`);
  console.log(`❌ Failed ${failed} contacts`);
}

update48Contacts().catch(console.error);
