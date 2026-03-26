const { google } = require('googleapis');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:N1500',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log('\nColumn indices:');
  headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
  
  console.log('\n\nFirst 5 data rows:');
  rows.slice(1, 6).forEach((row, i) => {
    console.log(`\nRow ${i+2}:`);
    row.forEach((val, j) => {
      if (val) console.log(`  [${j}] ${headers[j]}: ${val}`);
    });
  });
  
  // Find rows needing enrichment
  const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact'));
  const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
  const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  
  const needsEnrich = rows.slice(1).map((row, idx) => ({
    idx: idx + 2,
    company: row[companyIdx] || '',
    contact: row[contactIdx] || '',
    email: row[emailIdx] || '',
    status: row[statusIdx] || '',
  })).filter(r => {
    const hasCompany = r.company && r.company.trim() !== '';
    const noContact = !r.contact || r.contact === '';
    const notDead = r.status.toLowerCase() !== 'dead';
    const notEnriched = r.status.toLowerCase() !== 'enriched';
    return hasCompany && noContact && notDead && notEnriched;
  });
  
  console.log(`\n\nFound ${needsEnrich.length} rows needing enrichment`);
  console.log('\nFirst 20:');
  needsEnrich.slice(0, 20).forEach(r => {
    console.log(`  Row ${r.idx}: ${r.company} | Contact: ${r.contact || '(empty)'} | Email: ${r.email || '(empty)'} | Status: ${r.status}`);
  });
}

run().catch(console.error);
