const { google } = require('googleapis');

async function findEmptyEmails() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values;
  const needsEmail = [];
  const needsContact = [];
  
  for (let i = 600; i < Math.min(rows.length, rows.length); i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedin = row[6] || '';
    
    if (!company || company.trim() === '' || company === '(empty)') continue;
    
    // Has contact name but no email
    if (contact && contact !== '(empty)' && contact !== 'Not identified' &&
        (!email || email === '(empty)')) {
      needsEmail.push({
        row: i + 1,
        company,
        contact,
        title,
        linkedin
      });
    }
    
    // No contact at all
    if ((!contact || contact === '(empty)' || contact === 'Not identified') &&
        (!email || email === '(empty)')) {
      needsContact.push({
        row: i + 1,
        company,
        status: row[7] || ''
      });
    }
  }
  
  console.log('=== HAVE CONTACT, NEED EMAIL ===\n');
  needsEmail.slice(0, 10).forEach(t => {
    console.log(`Row ${t.row}: ${t.company}`);
    console.log(`  Contact: ${t.contact}`);
    console.log(`  Title: ${t.title || 'N/A'}`);
    console.log(`  LinkedIn: ${t.linkedin || 'N/A'}`);
    console.log('');
  });
  
  console.log(`\n\n=== NEED FULL ENRICHMENT (no contact, no email) ===\n`);
  needsContact.slice(0, 10).forEach(t => {
    console.log(`Row ${t.row}: ${t.company}`);
    console.log(`  Sector: ${t.status || 'N/A'}`);
    console.log('');
  });
  
  console.log(`\nSummary: ${needsEmail.length} need email, ${needsContact.length} need full enrichment`);
}

findEmptyEmails().catch(console.error);
