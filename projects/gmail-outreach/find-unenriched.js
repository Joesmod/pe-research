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
    range: 'Sheet1!A:M'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  console.log('=== ACTIVE FIRMS NEEDING ENRICHMENT ===\n');
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
    
    // Skip Dead/Sent/Replied
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('sent') ||
        status.toLowerCase().includes('replied')) {
      continue;
    }
    
    // Check if needs enrichment:
    // 1. Empty contact name
    // 2. Generic email (info@, sales@, ir@, contact@, general@)
    // 3. No email at all
    const hasEmptyContact = !contact || contact.trim() === '' || contact === 'TBD';
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') || 
      email.includes('contact@') ||
      email.includes('general@') ||
      email.includes('inquiries@')
    );
    const hasNoEmail = !email || email.trim() === '';
    
    if ((hasEmptyContact || hasGenericEmail || hasNoEmail) && count < 15) {
      const target = {
        row: i + 1,
        company,
        contact,
        title,
        email,
        website,
        linkedin,
        status,
        needsReason: []
      };
      
      if (hasEmptyContact) target.needsReason.push('Empty contact name');
      if (hasGenericEmail) target.needsReason.push('Generic email');
      if (hasNoEmail) target.needsReason.push('No email');
      
      targets.push(target);
      
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Contact: ${contact || 'EMPTY'}`);
      console.log(`  Email: ${email || 'EMPTY'}`);
      console.log(`  Status: ${status || 'New'}`);
      console.log(`  Needs: ${target.needsReason.join(', ')}`);
      console.log('');
      count++;
    }
  }
  
  console.log(`\nTotal firms needing enrichment: ${count}`);
  
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets.json', JSON.stringify(targets, null, 2));
  console.log('Saved to enrichment-targets.json');
  
  return targets;
}

findTargets().catch(console.error);
