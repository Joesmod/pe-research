const { google } = require('googleapis');

async function findTrulyEmpty() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:O',
  });
  
  const rows = response.data.values;
  
  console.log(`Total rows: ${rows.length}\n`);
  
  // Let me manually check some suspicious rows
  const testRows = [23, 26, 30, 48, 56, 71, 72];
  
  console.log('=== CHECKING SUSPICIOUS ROWS ===\n');
  
  testRows.forEach(rowNum => {
    const idx = rowNum - 1; // 0-indexed
    if (idx < rows.length) {
      const row = rows[idx];
      console.log(`Row ${rowNum}:`);
      console.log(`  Company (A): "${row[0] || ''}"`);
      console.log(`  Website (B): "${row[1] || ''}"`);
      console.log(`  Contact (C): "${row[2] || ''}"`);
      console.log(`  Title (D): "${row[3] || ''}"`);
      console.log(`  Email (E): "${row[4] || ''}"`);
      console.log(`  LinkedIn (F): "${row[5] || ''}"`);
      console.log(`  Status (G): "${row[6] || ''}"`);
      console.log('');
    }
  });
  
  // Now scan ALL rows for empty contacts or emails
  console.log('=== SCANNING FOR EMPTY/GENERIC EMAILS ===\n');
  
  const problems = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[6] || '').trim();
    
    if (!company) continue;
    if (status.toLowerCase().includes('remove') || status.toLowerCase().includes('dead')) continue;
    
    const noContact = !contact;
    const noEmail = !email;
    const genericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('admin@')
    );
    
    if (noContact || noEmail || genericEmail) {
      problems.push({
        row: i + 1,
        company,
        contact: contact || '(EMPTY)',
        email: email || '(EMPTY)',
        status,
        issue: noContact ? 'No contact' : genericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log(`Found ${problems.length} leads with issues\n`);
  
  // Show first 15
  problems.slice(0, 15).forEach(p => {
    console.log(`Row ${p.row}: ${p.company}`);
    console.log(`  Contact: ${p.contact}`);
    console.log(`  Email: ${p.email}`);
    console.log(`  Issue: ${p.issue}\n`);
  });
}

findTrulyEmpty().catch(console.error);
