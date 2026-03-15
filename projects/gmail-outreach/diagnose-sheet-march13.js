const { google } = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:O500'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('📋 COLUMN HEADERS:');
  headers.forEach((h, i) => {
    console.log(`  Col ${String.fromCharCode(65 + i)} (${i}): ${h}`);
  });
  
  console.log('\n📊 FIRST 5 DATA ROWS:');
  for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
    console.log(`\nRow ${i + 1}:`);
    rows[i].forEach((val, j) => {
      if (val) console.log(`  ${headers[j]}: ${val}`);
    });
  }
  
  console.log('\n🔍 ROWS NEEDING ENRICHMENT (empty Contact Name or generic email):');
  console.log('='.repeat(120));
  
  const firmCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const statusCol = headers.indexOf('Status');
  
  let count = 0;
  for (let i = 1; i < rows.length && count < 15; i++) {
    const row = rows[i];
    const firm = row[firmCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';
    
    const isGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('inquiries@')
    );
    
    if (firm && (!contact || !email || isGenericEmail)) {
      console.log(`Row ${i + 1}: ${firm}`);
      console.log(`  Contact: '${contact}'`);
      console.log(`  Email: '${email}'`);
      console.log(`  Status: ${status}`);
      console.log('');
      count++;
    }
  }
  
  console.log(`\nTotal firms needing enrichment: ${count}+`);
})().catch(console.error);
