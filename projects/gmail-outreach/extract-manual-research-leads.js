const { google } = require('googleapis');

async function extractManualResearchLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = result.data.values;
  const manualResearchLeads = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = row[7] || '';
    
    if (status === 'Needs Manual Research') {
      manualResearchLeads.push({
        rowIndex: i,
        sheetRow: i + 1,
        company: row[0] || '',
        website: row[1] || '',
        contactName: row[2] || '',
        title: row[3] || '',
        email: row[4] || '',
        otherUrl: row[5] || '',
        linkedin: row[6] || '',
        status: row[7] || '',
        notes: row[8] || ''
      });
    }
  }
  
  console.log(`🔍 Found ${manualResearchLeads.length} leads marked "Needs Manual Research"\n`);
  
  // Show first 15
  const toShow = manualResearchLeads.slice(0, 15);
  toShow.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.sheetRow}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Contact: ${lead.contactName}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Notes: ${lead.notes.substring(0, 100)}${lead.notes.length > 100 ? '...' : ''}`);
    console.log('');
  });
  
  // Save all to file
  const fs = require('fs');
  fs.writeFileSync(
    'manual-research-targets.json',
    JSON.stringify(manualResearchLeads, null, 2)
  );
  
  console.log(`💾 Saved all ${manualResearchLeads.length} leads to manual-research-targets.json`);
  
  return manualResearchLeads;
}

extractManualResearchLeads().catch(console.error);
