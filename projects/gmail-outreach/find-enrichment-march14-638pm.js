const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function findEnrichmentNeeds() {
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
  const needsEnrichment = [];
  
  // Skip header row (row 1)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    // Check if needs enrichment:
    // 1. Empty contact name
    // 2. Empty email
    // 3. Generic email (info@, sales@, ir@, contact@)
    const hasNoContact = !contactName || contactName.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    const hasGenericEmail = email && /^(info|sales|ir|contact|investor|admin|support)@/i.test(email);
    
    if (company && (hasNoContact || hasNoEmail || hasGenericEmail)) {
      needsEnrichment.push({
        rowIndex: i + 1, // Sheet is 1-indexed
        company,
        contactName,
        email,
        status,
        issue: hasNoContact ? 'No contact name' : (hasNoEmail ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log(`\n📊 Found ${needsEnrichment.length} leads needing enrichment:\n`);
  
  // Show first 20
  needsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`  Contact: ${lead.contactName || '(empty)'}`);
    console.log(`  Email: ${lead.email || '(empty)'}`);
    console.log(`  Issue: ${lead.issue}`);
    console.log(`  Status: ${lead.status}\n`);
  });
  
  // Save to file
  fs.writeFileSync(
    'enrichment-targets-march14-638pm.json',
    JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
  );
  
  console.log(`✅ Saved first 15 to enrichment-targets-march14-638pm.json`);
  console.log(`\n📈 Total needing enrichment: ${needsEnrichment.length}`);
}

findEnrichmentNeeds().catch(console.error);
