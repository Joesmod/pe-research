const { google } = require('googleapis');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:P200'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  console.log('=== HEADERS (Row 1) ===');
  console.log(rows[0].map((h, i) => `Col ${String.fromCharCode(65+i)}: ${h}`).join('\n'));
  
  console.log('\n=== SAMPLE ROWS (showing first 5 leads with issues) ===\n');
  
  const headers = rows[0];
  let count = 0;
  
  for (let i = 1; i < rows.length && count < 5; i++) {
    const row = rows[i];
    
    // Find Contact Name and Email column indices
    const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact'));
    const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
    const titleIdx = headers.findIndex(h => h && h.toLowerCase().includes('title'));
    const companyIdx = headers.findIndex(h => h && (h.toLowerCase().includes('company') || h.toLowerCase().includes('firm')));
    const websiteIdx = headers.findIndex(h => h && h.toLowerCase().includes('website'));
    
    const company = row[companyIdx] || 'N/A';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const website = row[websiteIdx] || '';
    
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') || 
      email.includes('contact@') ||
      email.includes('investor') ||
      !email.includes('@')
    );
    
    if (hasNoContact || hasGenericEmail || !email) {
      console.log(`Row ${i + 1}: ${company}`);
      console.log(`  Full row data (first 10 cols): [${row.slice(0, 10).join(' | ')}]`);
      console.log(`  Contact Name (Col ${String.fromCharCode(65+contactIdx)}): "${contact}"`);
      console.log(`  Title (Col ${String.fromCharCode(65+titleIdx)}): "${title}"`);
      console.log(`  Email (Col ${String.fromCharCode(65+emailIdx)}): "${email}"`);
      console.log(`  Website (Col ${String.fromCharCode(65+websiteIdx)}): "${website}"`);
      console.log('');
      count++;
    }
  }
}

inspectSheet().catch(console.error);
