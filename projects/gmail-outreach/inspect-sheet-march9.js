const { google } = require('googleapis');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log(`\nTotal rows: ${rows.length}\n`);
  
  // Find rows needing enrichment
  const colMap = {
    company: headers.findIndex(h => h && h.toLowerCase().includes('company')),
    contact: headers.findIndex(h => h && h.toLowerCase().includes('contact')),
    email: headers.findIndex(h => h && h.toLowerCase().includes('email')),
    website: headers.findIndex(h => h && h.toLowerCase().includes('website')),
    status: headers.findIndex(h => h && h.toLowerCase().includes('status'))
  };
  
  console.log('Sample rows needing enrichment:\n');
  let count = 0;
  for (let i = 1; i < rows.length && count < 5; i++) {
    const row = rows[i];
    const company = row[colMap.company] || '';
    const contact = row[colMap.contact] || '';
    const email = row[colMap.email] || '';
    const website = row[colMap.website] || '';
    const status = row[colMap.status] || '';
    
    const needsEnrichment = !contact || 
                           email.startsWith('info@') || 
                           email.startsWith('sales@') || 
                           email.startsWith('ir@') ||
                           !email;
    
    if (needsEnrichment && company && status !== 'Enriched' && !status.includes('Dead') && status !== 'Sent' && status !== 'Replied') {
      console.log(`${count + 1}. ${company}`);
      console.log(`   Contact: ${contact || '[EMPTY]'}`);
      console.log(`   Email: ${email || '[EMPTY]'}`);
      console.log(`   Website: ${website || '[EMPTY]'}`);
      console.log(`   Status: ${status}`);
      console.log('');
      count++;
    }
  }
}

inspectSheet().catch(console.error);
