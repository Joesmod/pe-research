const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function checkEmptyStatus() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values;
  const emptyStatusLeads = [];
  
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (!company) continue;
    
    // Only look at empty status
    if (!status || status.trim() === '') {
      // Check if needs enrichment
      const hasNoContact = !contactName || contactName.trim() === '';
      const hasNoEmail = !email || email.trim() === '';
      const hasGenericEmail = email && /^(info|sales|ir|contact|investor|admin|support)@/i.test(email);
      
      if (hasNoContact || hasNoEmail || hasGenericEmail) {
        emptyStatusLeads.push({
          rowIndex: i + 1,
          company,
          contactName: contactName || '(empty)',
          email: email || '(empty)',
          issue: hasNoContact ? 'No contact' : (hasNoEmail ? 'No email' : 'Generic email')
        });
      }
    }
  }
  
  console.log(`\n📊 Empty status leads needing enrichment: ${emptyStatusLeads.length}\n`);
  
  // Show first 15
  emptyStatusLeads.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`  Contact: ${lead.contactName}`);
    console.log(`  Email: ${lead.email}`);
    console.log(`  Issue: ${lead.issue}\n`);
  });
  
  // Save to file
  fs.writeFileSync(
    'enrichment-empty-status-march14-640pm.json',
    JSON.stringify(emptyStatusLeads.slice(0, 15), null, 2)
  );
  
  console.log(`✅ Saved first 15 to enrichment-empty-status-march14-640pm.json`);
}

checkEmptyStatus().catch(console.error);
