const { google } = require('googleapis');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log(`Total rows: ${rows.length}`);
  console.log('\nFirst 5 rows:');
  rows.slice(0, 5).forEach((row, i) => {
    console.log(`Row ${i}: ${JSON.stringify(row)}`);
  });
  
  console.log('\n\nFirms WITH company names that need enrichment:');
  console.log('='.repeat(120));
  
  let count = 0;
  for (let i = 0; i < rows.length; i++) {
    const [firm, aum, contact, title, email, website, linkedin, status, notes, lastContact] = rows[i];
    
    // Must have a firm name that's not 'N/A' or empty
    if (!firm || firm === 'N/A' || firm === 'Company Name') continue;
    
    // Needs enrichment if missing contact OR missing/generic email
    const needsEnrichment = !contact || !email || email.match(/^(info|sales|ir|contact)@/i);
    
    if (needsEnrichment && count < 20) {
      console.log(`\nRow ${i+1}: ${firm}`);
      console.log(`  AUM: ${aum || '[EMPTY]'}`);
      console.log(`  Contact: ${contact || '[EMPTY]'}`);
      console.log(`  Title: ${title || '[EMPTY]'}`);
      console.log(`  Email: ${email || '[EMPTY]'}`);
      console.log(`  Website: ${website || '[EMPTY]'}`);
      console.log(`  LinkedIn: ${linkedin || '[EMPTY]'}`);
      console.log(`  Status: ${status || '[EMPTY]'}`);
      count++;
    }
  }
  
  console.log(`\n\nFound ${count}+ firms needing enrichment`);
}

readSheet().catch(console.error);
