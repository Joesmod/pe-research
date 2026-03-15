const { google } = require('googleapis');
const fs = require('fs');

async function findUnresearched() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A:K',
  });
  
  const rows = response.data.values;
  const unresearched = [];
  
  console.log('=== Finding "New - Unresearched" Leads ===\n');
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const status = row[9] || '';
    const sector = row[7] || '';
    
    if (status === 'New - Unresearched') {
      unresearched.push({
        rowIndex: i + 1,
        company,
        website,
        sector,
        currentContact: contact,
        currentEmail: email
      });
    }
  }
  
  console.log(`Found ${unresearched.length} unresearched leads.\n`);
  
  // Show first 15
  console.log('=== First 15 Unresearched Leads ===\n');
  unresearched.slice(0, 15).forEach(lead => {
    console.log(`${lead.rowIndex}. ${lead.company}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Sector: ${lead.sector || '(none)'}\n`);
  });
  
  // Save to file for next run
  fs.writeFileSync('unresearched-leads-march9-136pm.json', JSON.stringify(unresearched, null, 2));
  console.log(`✓ Saved all ${unresearched.length} leads to unresearched-leads-march9-136pm.json`);
}

findUnresearched().catch(console.error);
