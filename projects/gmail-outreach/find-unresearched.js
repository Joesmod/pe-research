const { google } = require('googleapis');

async function findUnresearched() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:P1000'  // Expand range
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
    
    if (!company) continue;  // Skip empty rows
    
    // Skip definitively dead firms
    if (status.toLowerCase().includes('dead') || 
        status.toLowerCase().includes('merged') ||
        status.toLowerCase().includes('acquired')) {
      continue;
    }
    
    // Look for:
    // 1. Status = "Unresearched" or empty
    // 2. Missing contact info
    // 3. Data quality issues
    
    const unresearched = status.toLowerCase().includes('unresearched') || status.toLowerCase().includes('research') || status === '';
    const emptyContact = !contact || contact.trim() === '';
    const emptyEmail = !email || email.trim() === '';
    const badEmail = email && (!email.includes('@') || email.includes('[email protected]') || email.startsWith('http'));
    const genericEmail = email && email.includes('@') && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    if (unresearched || emptyContact || emptyEmail || badEmail || genericEmail) {
      targets.push({
        row: i + 1,
        company,
        contact: contact || '(none)',
        title: title || '(none)',
        email: email || '(none)',
        website: website || '(none)',
        linkedin: linkedin || '(none)',
        status: status || '(none)',
        reason: unresearched ? 'Unresearched' :
                emptyContact ? 'No contact' :
                emptyEmail ? 'No email' :
                badEmail ? 'Bad email format' :
                genericEmail ? 'Generic email' : 'Unknown'
      });
    }
    
    if (targets.length >= 20) break;  // Get 20 to choose best 15
  }
  
  console.log(`\n=== FOUND ${targets.length} ENRICHABLE FIRMS ===\n`);
  
  const top15 = targets.slice(0, 15);
  
  top15.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.company} (Row ${t.row})`);
    console.log(`   Reason: ${t.reason}`);
    console.log(`   Contact: ${t.contact}`);
    console.log(`   Email: ${t.email}`);
    console.log(`   Website: ${t.website}`);
    console.log(`   Status: ${t.status}`);
    console.log('');
  });
  
  const fs = require('fs');
  fs.writeFileSync('enrichment-targets-march10-final.json', JSON.stringify(top15, null, 2));
  console.log(`✓ Saved ${top15.length} targets to enrichment-targets-march10-final.json`);
  
  return top15;
}

findUnresearched().catch(console.error);
