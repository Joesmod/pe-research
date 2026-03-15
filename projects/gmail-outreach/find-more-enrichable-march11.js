const { google } = require('googleapis');

async function findMoreEnrichable() {
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
    
    // Skip dead/inactive/acquired/merged firms
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('inactive') ||
        status.toLowerCase().includes('acquired') ||
        status.toLowerCase().includes('merged')) {
      continue;
    }
    
    // Be aggressive: include any row with missing or generic contact info
    const emptyContact = !contact || contact.trim() === '';
    const emptyEmail = !email || email.trim() === '';
    const invalidEmail = email === 'N/A' || email === 'n/a';
    const genericEmail = email && email.includes('@') && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('admin@') ||
      email.toLowerCase().startsWith('support@')
    );
    
    // Include "Needs Manual Research" status
    const needsResearch = status.toLowerCase().includes('needs manual research');
    
    const needsEnrichment = emptyContact || emptyEmail || invalidEmail || genericEmail || needsResearch;
    
    if (needsEnrichment && company) {
      const priority = (emptyContact || emptyEmail || invalidEmail) ? 'HIGH' :
                       genericEmail ? 'MEDIUM' :
                       needsResearch ? 'LOW' :
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
          invalidEmail && 'Invalid email (N/A)',
          genericEmail && 'Generic email',
          needsResearch && 'Needs Manual Research status'
        ].filter(Boolean)
      });
    }
  }
  
  // Sort by priority
  targets.sort((a, b) => {
    const priorities = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
    return priorities[a.priority] - priorities[b.priority];
  });
  
  const top20 = targets.slice(0, 20);
  
  console.log(`\n=== TOP 20 ENRICHMENT CANDIDATES (from ${targets.length} total) ===\n`);
  
  top20.forEach((t, idx) => {
    console.log(`${idx + 1}. [${t.priority}] ${t.company} (Row ${t.row})`);
    console.log(`   Contact: ${t.contact}`);
    console.log(`   Email: ${t.email}`);
    console.log(`   Status: ${t.status}`);
    console.log(`   Website: ${t.website || 'N/A'}`);
    console.log(`   Issues: ${t.issues.join(', ')}`);
    console.log('');
  });
  
  const fs = require('fs');
  fs.writeFileSync('more-enrichable-march11-10pm.json', JSON.stringify(top20, null, 2));
  console.log(`✓ Saved top 20 to more-enrichable-march11-10pm.json`);
  
  return top20;
}

findMoreEnrichable().catch(console.error);
