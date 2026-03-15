const { google } = require('googleapis');

async function findAllTargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:M'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  console.log('=== ALL FIRMS WITH ISSUES (not Dead) ===\n');
  let count = 0;
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const status = row[9] || '';
    
    // Skip Dead, skip if no company name
    if (!company || status.toLowerCase().includes('dead')) continue;
    
    // Check for any issue
    const hasNoContact = !contact || contact.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@') || email.includes('general@'));
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      const target = {
        row: i + 1,
        company,
        contact,
        title,
        email,
        website,
        linkedin,
        status
      };
      
      targets.push(target);
      
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Contact: ${contact || 'NONE'}`);
      console.log(`  Email: ${email || 'NONE'}`);
      console.log(`  Website: ${website || 'NONE'}`);
      console.log(`  Status: ${status}`);
      
      let issues = [];
      if (hasNoContact) issues.push('NO_CONTACT');
      if (hasNoEmail) issues.push('NO_EMAIL');
      if (hasGenericEmail) issues.push('GENERIC_EMAIL');
      console.log(`  Issues: ${issues.join(', ')}`);
      console.log('');
      
      count++;
      if (count >= 20) break; // Limit output
    }
  }
  
  console.log(`\nTotal found: ${targets.length}`);
  console.log(`First 15 saved to enrichment-targets.json`);
  
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets.json', JSON.stringify(targets.slice(0, 15), null, 2));
}

findAllTargets().catch(console.error);
