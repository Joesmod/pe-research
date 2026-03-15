const { google } = require('googleapis');

async function status() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = result.data.values;
  
  console.log('=== PE PROSPECT SHEET ENRICHMENT STATUS ===\n');
  console.log(`Total rows: ${rows.length - 1} firms\n`);
  
  // Count by status
  const statusCounts = {};
  let hasEmail = 0;
  let hasContact = 0;
  let hasLinkedIn = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const status = rows[i][7] || 'No Status';
    const email = rows[i][4];
    const contact = rows[i][2];
    const linkedin = rows[i][6];
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    if (email && email.trim()) hasEmail++;
    if (contact && contact.trim()) hasContact++;
    if (linkedin && linkedin.trim()) hasLinkedIn++;
  }
  
  console.log('Status breakdown:');
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
  
  console.log(`\nData completeness:`);
  console.log(`  Firms with contact name: ${hasContact} (${(hasContact/(rows.length-1)*100).toFixed(1)}%)`);
  console.log(`  Firms with email: ${hasEmail} (${(hasEmail/(rows.length-1)*100).toFixed(1)}%)`);
  console.log(`  Firms with LinkedIn: ${hasLinkedIn} (${(hasLinkedIn/(rows.length-1)*100).toFixed(1)}%)`);
  
  // Recent enrichments
  console.log(`\n=== RECENT VERIFIED ENRICHMENTS ===\n`);
  const myEnrichments = [
    'Warburg Pincus',
    'Revelstoke Capital Partners',
    'Rockwood Equity',
    'LFM Capital'
  ];
  
  for (const company of myEnrichments) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].includes(company) && rows[i][7] === 'Enriched') {
        console.log(`✓ ${rows[i][0]}`);
        console.log(`  Contact: ${rows[i][2]}`);
        console.log(`  Title: ${rows[i][3]}`);
        console.log(`  Email: ${rows[i][4]}`);
        console.log('');
        break;
      }
    }
  }
}

status().catch(console.error);
