const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function findMissingContacts() {
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
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[1] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    
    if (!company) continue;
    
    // Missing contact OR missing email
    if (!contactName || !contactName.trim() || !email || !email.trim()) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        website,
        contactName: contactName || '(empty)',
        email: email || '(empty)',
        issue: !contactName ? 'Missing contact' : 'Missing email'
      });
    }
  }
  
  console.log(`\n📋 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15
  const first15 = needsEnrichment.slice(0, 15);
  first15.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Contact: ${lead.contactName}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Issue: ${lead.issue}\n`);
  });
  
  // Save to file
  fs.writeFileSync(
    'enrichment-targets-march14-642pm.json',
    JSON.stringify(first15, null, 2)
  );
  
  console.log(`✅ Saved first 15 to enrichment-targets-march14-642pm.json`);
  console.log(`\n📊 Total needing enrichment: ${needsEnrichment.length}`);
}

findMissingContacts().catch(console.error);
