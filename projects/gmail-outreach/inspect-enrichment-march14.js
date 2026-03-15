const { google } = require('googleapis');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get all data
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  console.log('=== COLUMN STRUCTURE ===');
  headers.forEach((h, i) => console.log(`Col ${i} (${String.fromCharCode(65+i)}): ${h}`));
  
  console.log('\n=== SAMPLE ROWS (showing contact/email columns) ===');
  
  // Find the correct column indices
  const companyCol = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  const contactCol = headers.findIndex(h => h && (h.toLowerCase().includes('contact') || h.toLowerCase().includes('name')));
  const emailCol = headers.findIndex(h => h && h.toLowerCase().includes('email'));
  const websiteCol = headers.findIndex(h => h && h.toLowerCase().includes('website'));
  const statusCol = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  
  console.log(`\nColumn mappings:`);
  console.log(`  Company: ${companyCol}`);
  console.log(`  Contact: ${contactCol}`);
  console.log(`  Email: ${emailCol}`);
  console.log(`  Website: ${websiteCol}`);
  console.log(`  Status: ${statusCol}`);
  
  console.log('\n=== FIRST 20 DATA ROWS ===');
  for (let i = 1; i < Math.min(21, rows.length); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    console.log(`  Company: ${row[companyCol] || '(empty)'}`);
    console.log(`  Contact: ${row[contactCol] || '(empty)'}`);
    console.log(`  Email: ${row[emailCol] || '(empty)'}`);
    console.log(`  Website: ${row[websiteCol] || '(empty)'}`);
    console.log(`  Status: ${row[statusCol] || '(empty)'}`);
  }
  
  // Now find leads with empty/generic emails
  console.log('\n\n=== LEADS WITH EMPTY OR GENERIC EMAILS ===');
  const problematic = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    if (!company) continue;
    
    const hasNoContact = !contact || contact.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('admin@')
    );
    
    if (hasNoContact || hasNoEmail || hasGenericEmail) {
      problematic.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        issue: hasNoContact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log(`\nFound ${problematic.length} leads with issues`);
  problematic.slice(0, 15).forEach(p => {
    console.log(`\nRow ${p.row}: ${p.company}`);
    console.log(`  Contact: ${p.contact || '(empty)'}`);
    console.log(`  Email: ${p.email || '(empty)'}`);
    console.log(`  Status: ${p.status}`);
    console.log(`  Issue: ${p.issue}`);
  });
}

inspectSheet().catch(console.error);
