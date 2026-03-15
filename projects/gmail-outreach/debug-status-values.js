const { google } = require('googleapis');

async function debugStatusValues() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = result.data.values;
  console.log(`Total rows: ${rows.length}\n`);
  
  // Collect unique status values
  const statusCounts = {};
  const examples = {};
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (!company.trim()) continue;
    
    if (!statusCounts[status]) {
      statusCounts[status] = 0;
      examples[status] = [];
    }
    
    statusCounts[status]++;
    
    if (examples[status].length < 3) {
      examples[status].push({
        row: i + 1,
        company,
        contact: contactName,
        email,
        status
      });
    }
  }
  
  // Print status breakdown
  console.log('📊 STATUS VALUE BREAKDOWN:\n');
  Object.keys(statusCounts).sort((a, b) => statusCounts[b] - statusCounts[a]).forEach(status => {
    console.log(`"${status}": ${statusCounts[status]} rows`);
    examples[status].forEach(ex => {
      console.log(`  Row ${ex.row}: ${ex.company}`);
      console.log(`    Contact: '${ex.contact}'`);
      console.log(`    Email: '${ex.email}'`);
    });
    console.log('');
  });
}

debugStatusValues().catch(console.error);
