const { google } = require('googleapis');

async function findGenericEmails() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  
  console.log('=== SEARCHING FOR GENERIC EMAILS ===\n');
  
  let genericEmails = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip dead entries
    if (status && (status.includes('Dead') || status.includes('Not PE'))) {
      continue;
    }
    
    // Check for generic email patterns
    if (email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('inquiries@') ||
      email.toLowerCase().startsWith('investor@') ||
      email.toLowerCase().startsWith('media@')
    )) {
      genericEmails.push({
        row: i + 1,
        company,
        contact,
        email,
        status
      });
    }
  }
  
  console.log(`Found ${genericEmails.length} firms with generic emails\n`);
  
  // Show all
  genericEmails.forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact || 'EMPTY'}`);
    console.log(`  Email: ${lead.email}`);
    console.log(`  Status: ${lead.status || 'N/A'}`);
    console.log('');
  });
}

findGenericEmails().catch(console.error);
