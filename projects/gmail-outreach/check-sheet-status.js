const { google } = require('googleapis');

async function check() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:I200'
  });
  
  const rows = response.data.values || [];
  console.log('Sheet columns:', rows[0]);
  console.log('\nFirst 5 data rows:');
  for (let i = 1; i <= 5 && i < rows.length; i++) {
    const r = rows[i] || [];
    console.log(`Row ${i+1}:`);
    console.log(`  Company: ${r[0]}`);
    console.log(`  Website: ${r[1]}`);
    console.log(`  Contact: ${r[2]}`);
    console.log(`  Title: ${r[3]}`);
    console.log(`  Email: ${r[4]}`);
    console.log(`  Status: ${r[7]}`);
    console.log('');
  }
  
  // Find truly empty contacts
  const emptyContacts = [];
  const genericEmails = [];
  
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const company = (r[0] || '').trim();
    const website = (r[1] || '').trim();
    const contact = (r[2] || '').trim();
    const email = (r[4] || '').trim();
    const status = (r[7] || '').trim().toLowerCase();
    
    if (!company || status.includes('dead') || status.includes('not pe')) {
      continue;
    }
    
    if (!contact) {
      emptyContacts.push({ row: i+1, company, website, status });
    }
    
    if (email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@')
    )) {
      genericEmails.push({ row: i+1, company, email, status });
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Empty contacts (active firms): ${emptyContacts.length}`);
  console.log(`Generic emails: ${genericEmails.length}`);
  
  if (emptyContacts.length > 0) {
    console.log('\n=== FIRMS WITH EMPTY CONTACTS (First 10) ===');
    emptyContacts.slice(0, 10).forEach(item => {
      console.log(`Row ${item.row}: ${item.company} | ${item.website} | Status: ${item.status || 'none'}`);
    });
  }
  
  if (genericEmails.length > 0) {
    console.log('\n=== FIRMS WITH GENERIC EMAILS (First 10) ===');
    genericEmails.slice(0, 10).forEach(item => {
      console.log(`Row ${item.row}: ${item.company} | ${item.email} | Status: ${item.status || 'none'}`);
    });
  }
}

check().catch(console.error);
