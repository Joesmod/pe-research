const { google } = require('googleapis');

async function findAllEnrichable() {
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
    const linkedin = row[6] || '';
    const status = row[9] || '';
    
    // Skip dead/inactive/enriched
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('inactive') ||
        status.toLowerCase().includes('acquired') ||
        status.toLowerCase().includes('merged')) {
      continue;
    }
    
    // Prioritize real issues
    const emptyContact = !contact || contact.trim() === '';
    const emptyEmail = !email || email.trim() === '';
    const placeholderEmail = email && (email.includes('[email protected]') || email.includes('protected'));
    const invalidEmail = email && (!email.includes('@') || email.startsWith('http'));
    const genericEmail = email && email.includes('@') && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    // Secondary criteria
    const contactIsTitle = contact && (
      contact.toLowerCase().includes('partner') ||
      contact.toLowerCase().includes('managing director') ||
      contact.toLowerCase().includes('ceo') ||
      contact.toLowerCase().includes('cfo') ||
      contact.toLowerCase().includes('president')
    ) && !contact.includes(' '); // Single word like "Partner" not "John Partner"
    
    const noLinkedIn = !linkedin || linkedin.trim() === '';
    
    const needsEnrichment = emptyContact || emptyEmail || placeholderEmail || 
                           invalidEmail || genericEmail || contactIsTitle;
    
    if (needsEnrichment && company) {
      const priority = (emptyContact || emptyEmail || placeholderEmail || invalidEmail) ? 'HIGH' :
                       genericEmail ? 'MEDIUM' :
                       'LOW';
      
      targets.push({
        row: i + 1,
        company,
        contact: contact || '(empty)',
        title: title || '(empty)',
        email: email || '(empty)',
        website,
        linkedin,
        status,
        priority,
        issues: [
          emptyContact && 'Empty contact',
          emptyEmail && 'Empty email',
          placeholderEmail && 'Placeholder email',
          invalidEmail && 'Invalid email',
          genericEmail && 'Generic email',
          contactIsTitle && 'Contact is job title only'
        ].filter(Boolean)
      });
    }
  }
  
  // Sort by priority
  targets.sort((a, b) => {
    const priorities = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
    return priorities[a.priority] - priorities[b.priority];
  });
  
  const top15 = targets.slice(0, 15);
  
  console.log(`\n=== TOP 15 ENRICHMENT CANDIDATES (from ${targets.length} total) ===\n`);
  
  top15.forEach((t, idx) => {
    console.log(`${idx + 1}. [${t.priority}] ${t.company} (Row ${t.row})`);
    console.log(`   Contact: ${t.contact}`);
    console.log(`   Email: ${t.email}`);
    console.log(`   Website: ${t.website || 'N/A'}`);
    console.log(`   Issues: ${t.issues.join(', ')}`);
    console.log('');
  });
  
  const fs = require('fs');
  fs.writeFileSync('enrichment-candidates-top15-march10.json', JSON.stringify(top15, null, 2));
  console.log(`✓ Saved top 15 to enrichment-candidates-top15-march10.json`);
  
  return top15;
}

findAllEnrichable().catch(console.error);
