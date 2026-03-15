const { google } = require('googleapis');

async function findTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:P500'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  const headers = rows[0];
  const companyIdx = 0; // Column A
  const contactIdx = 2;  // Column C
  const titleIdx = 3;    // Column D
  const emailIdx = 4;    // Column E
  const websiteIdx = 5;  // Column F
  const statusIdx = 9;   // Column J
  const notesIdx = 11;   // Column L
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const website = row[websiteIdx] || '';
    const status = row[statusIdx] || '';
    const notes = row[notesIdx] || '';
    
    // Skip dead/inactive firms
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('inactive') ||
        status.toLowerCase().includes('merged') ||
        status.toLowerCase().includes('acquired')) {
      continue;
    }
    
    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const noEmail = !email || email.trim() === '';
    const genericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('investor')
    );
    
    // Email doesn't have @ = data misalignment
    const badEmail = email && !email.includes('@') && email.length > 5;
    
    if ((noContact || noEmail || genericEmail || badEmail) && company) {
      targets.push({
        row: i + 1,
        company,
        contact,
        title,
        email,
        website,
        status,
        notes,
        reason: noContact ? 'No contact name' : 
                noEmail ? 'No email' : 
                genericEmail ? 'Generic email' : 
                badEmail ? 'Data misalignment' : 'Unknown'
      });
    }
    
    if (targets.length >= 15) break;
  }
  
  console.log(`\n=== ENRICHMENT TARGETS (${targets.length} firms) ===\n`);
  targets.forEach(t => {
    console.log(`Row ${t.row}: ${t.company}`);
    console.log(`  Contact: "${t.contact}" ${!t.contact ? '❌' : '✓'}`);
    console.log(`  Email: "${t.email}" ${!t.email || t.email.includes('info@') || !t.email.includes('@') ? '❌' : '✓'}`);
    console.log(`  Website: ${t.website || 'N/A'}`);
    console.log(`  Status: ${t.status || 'N/A'}`);
    console.log(`  Reason: ${t.reason}`);
    console.log('');
  });
  
  // Save to JSON
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-march10-0236am.json', JSON.stringify(targets, null, 2));
  console.log(`Saved ${targets.length} targets to enrichment-targets-march10-0236am.json`);
}

findTargets().catch(console.error);
