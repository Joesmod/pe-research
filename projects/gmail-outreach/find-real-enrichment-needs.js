const { google } = require('googleapis');

async function findRealNeeds() {
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
  
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const status = row[9] || '';
    
    // Skip dead/inactive
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('inactive')) {
      continue;
    }
    
    // True enrichment needs:
    // 1. Empty contact name
    // 2. Empty email
    // 3. Email is placeholder like "[email protected]"
    // 4. Email is not actually an email (no @ or is a URL)
    // 5. Generic emails: info@, ir@, sales@, contact@
    
    const emptyContact = !contact || contact.trim() === '';
    const emptyEmail = !email || email.trim() === '';
    const placeholderEmail = email && (email.includes('[email protected]') || email.includes('email'));
    const invalidEmail = email && (!email.includes('@') || email.startsWith('http'));
    const genericEmail = email && email.includes('@') && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('investor')
    );
    
    const needsEnrichment = emptyContact || emptyEmail || placeholderEmail || invalidEmail || genericEmail;
    
    if (needsEnrichment && company) {
      targets.push({
        row: i + 1,
        company,
        contact: contact || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        website,
        status,
        issues: [
          emptyContact && 'No contact name',
          emptyEmail && 'No email',
          placeholderEmail && 'Placeholder email',
          invalidEmail && 'Invalid email format',
          genericEmail && 'Generic email'
        ].filter(Boolean)
      });
    }
    
    if (targets.length >= 15) break;
  }
  
  console.log(`\n=== ${targets.length} FIRMS NEED ENRICHMENT ===\n`);
  
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (Row ${t.row})`);
    console.log(`   Contact: ${t.contact}`);
    console.log(`   Title: ${t.title}`);
    console.log(`   Email: ${t.email}`);
    console.log(`   Website: ${t.website || 'N/A'}`);
    console.log(`   Issues: ${t.issues.join(', ')}`);
    console.log('');
  });
  
  const fs = require('fs');
  fs.writeFileSync('enrichment-needs-real-march10.json', JSON.stringify(targets, null, 2));
  console.log(`✓ Saved to enrichment-needs-real-march10.json`);
  
  return targets;
}

findRealNeeds().catch(console.error);
