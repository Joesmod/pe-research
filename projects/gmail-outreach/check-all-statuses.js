const { google } = require('googleapis');

async function checkAllStatuses() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  
  let statusCounts = {};
  let targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0];
    const contact = row[2];
    const email = row[4];
    const status = row[7] || '[NO STATUS]';
    
    if (!firm || firm.trim() === '' || firm === 'N/A') continue;
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    // Collect non-enriched firms
    if (status !== 'Enriched' && targets.length < 20) {
      targets.push({
        row: i + 1,
        firm,
        website: row[1] || '',
        contact: contact || '[NONE]',
        email: email || '[NONE]',
        status: status
      });
    }
  }
  
  console.log('Status distribution:');
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  console.log(`\n\nFirst 20 non-enriched firms:\n`);
  targets.forEach(t => {
    console.log(`Row ${t.row}: ${t.firm}`);
    console.log(`  Status: ${t.status}`);
    console.log(`  Website: ${t.website}`);
    console.log(`  Contact: ${t.contact}`);
    console.log(`  Email: ${t.email}`);
    console.log('---');
  });
  
  require('fs').writeFileSync('non-enriched-targets.json', JSON.stringify(targets, null, 2));
  console.log(`\nWrote ${targets.length} non-enriched targets to non-enriched-targets.json`);
}

checkAllStatuses().catch(console.error);
