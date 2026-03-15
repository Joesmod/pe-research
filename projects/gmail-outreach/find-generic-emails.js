const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M300'
  });
  
  const rows = res.data.values || [];
  
  console.log('Searching for firms with generic emails or missing direct contacts...\n');
  
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const notebookLM = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const sector = row[7] || '';
    const portfolio = row[8] || '';
    const status = row[9] || '';
    const notes = row[11] || '';
    
    // Look for generic emails
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'marketing@', 'admin@', 'hello@', 'support@', 'team@'];
    const hasGenericEmail = genericPrefixes.some(prefix => email && email.toLowerCase().includes(prefix));
    
    // Look for missing contact name
    const noContact = !contact || contact.trim() === '';
    
    // Look for empty or obviously wrong emails
    const noEmail = !email || email.trim() === '';
    const emailLooksWrong = email && (email.length < 5 || !email.includes('@') || !email.includes('.'));
    
    // Skip dead/sent leads
    const isActive = status !== 'Dead' && status !== 'Sent' && status !== 'Dead Lead';
    
    if (company && company !== 'Company Name' && isActive && (hasGenericEmail || noContact || noEmail || emailLooksWrong)) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact: contact || '[EMPTY]',
        title: title || '[EMPTY]',
        email: email || '[EMPTY]',
        website,
        status: status || 'Active',
        issue: hasGenericEmail ? 'Generic email' : noContact ? 'No contact name' : noEmail ? 'No email' : 'Email format issue'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms that need enrichment:\n`);
  
  needsEnrichment.forEach((firm, idx) => {
    if (idx < 20) {
      console.log(`${idx + 1}. Row ${firm.row}: ${firm.company}`);
      console.log(`   Contact: ${firm.contact}`);
      console.log(`   Email: ${firm.email}`);
      console.log(`   Issue: ${firm.issue}`);
      console.log(`   Website: ${firm.website}`);
      console.log(`   Status: ${firm.status}\n`);
    }
  });
  
  if (needsEnrichment.length > 20) {
    console.log(`... and ${needsEnrichment.length - 20} more`);
  }
})();
