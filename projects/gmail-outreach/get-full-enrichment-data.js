const { google } = require('googleapis');

async function getFullEnrichmentData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  console.log('Column mapping:');
  header.forEach((col, idx) => console.log(`  ${idx}: ${col}`));
  console.log('\n');
  
  let needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';  // Column C
    const title = row[3] || '';        // Column D
    const email = row[4] || '';        // Column E
    const website = row[5] || '';      // Column F
    const linkedin = row[6] || '';     // Column G
    const status = row[9] || '';       // Column J
    
    // Skip if already "Dead" or "Sent"
    if (status === 'Dead' || status === 'Sent') continue;
    
    // Check if needs enrichment: no contact name OR no email OR generic email
    const hasGenericEmail = email.match(/^(info|sales|contact|ir|hello|support)@/i);
    const needsContact = !contactName || contactName.trim() === '';
    const needsRealEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsRealEmail) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contactName,
        title,
        email,
        website,
        linkedin,
        status,
        needsContact,
        needsRealEmail
      });
    }
  }
  
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Needs enrichment: ${needsEnrichment.length}\n`);
  
  // Show first 20
  console.log('=== First 20 Targets ===\n');
  needsEnrichment.slice(0, 20).forEach(item => {
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  Contact: ${item.contactName || '(MISSING)'}`);
    console.log(`  Title: ${item.title || '(none)'}`);
    console.log(`  Email: ${item.email || '(MISSING)'}`);
    console.log(`  Website: ${item.website || '(none)'}`);
    console.log(`  Status: ${item.status}`);
    console.log();
  });
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-full-march4-7am.json', JSON.stringify(needsEnrichment, null, 2));
  console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-full-march4-7am.json`);
}

getFullEnrichmentData().catch(console.error);
