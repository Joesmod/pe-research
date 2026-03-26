const { google } = require('googleapis');

async function checkEmptyRows() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  
  console.log(`Total rows in sheet: ${rows.length}\n`);
  
  // Check distribution
  let enriched = 0;
  let needsWork = 0;
  let empty = 0;
  let genericEmail = 0;
  let noEmail = 0;
  let noContact = 0;
  
  let targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0];
    const contact = row[2];
    const email = row[4];
    const status = row[7];
    
    if (!firm || firm.trim() === '' || firm === 'N/A') {
      empty++;
      continue;
    }
    
    if (status === 'Enriched') {
      enriched++;
      continue;
    }
    
    // Check what's needed
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|support)@/i);
    const hasNoEmail = !email || email.trim() === '';
    const hasNoContact = !contact || contact.trim() === '';
    
    if (hasGenericEmail) genericEmail++;
    if (hasNoEmail) noEmail++;
    if (hasNoContact) noContact++;
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      needsWork++;
      if (targets.length < 15) {
        targets.push({
          row: i + 1,
          firm,
          website: row[1] || '',
          contact: contact || '[NONE]',
          email: email || '[NONE]',
          status: status || '[NONE]',
          issue: hasNoContact ? 'No Contact' : hasNoEmail ? 'No Email' : 'Generic Email'
        });
      }
    }
  }
  
  console.log('Sheet Statistics:');
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Needs Work: ${needsWork}`);
  console.log(`    - No contact: ${noContact}`);
  console.log(`    - No email: ${noEmail}`);
  console.log(`    - Generic email: ${genericEmail}`);
  console.log(`  Empty rows: ${empty}`);
  
  console.log(`\n\nFirst 15 firms needing enrichment:\n`);
  targets.forEach(t => {
    console.log(`Row ${t.row}: ${t.firm} (${t.issue})`);
    console.log(`  Website: ${t.website}`);
    console.log(`  Contact: ${t.contact}`);
    console.log(`  Email: ${t.email}`);
    console.log('---');
  });
  
  require('fs').writeFileSync('enrichment-targets.json', JSON.stringify(targets, null, 2));
  console.log(`\nWrote ${targets.length} targets to enrichment-targets.json`);
}

checkEmptyRows().catch(console.error);
