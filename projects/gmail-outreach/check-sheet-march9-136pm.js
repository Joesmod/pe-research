const { google } = require('googleapis');

async function checkSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A:K',
  });
  
  const rows = response.data.values;
  console.log(`Total rows: ${rows.length}\n`);
  console.log('Headers:', rows[0].join(' | '));
  console.log('\n=== First 10 rows of data ===\n');
  
  for (let i = 1; i < Math.min(11, rows.length); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    console.log(`  Company: ${row[0] || '(empty)'}`);
    console.log(`  Contact Name: ${row[2] || '(empty)'}`);
    console.log(`  Title: ${row[3] || '(empty)'}`);
    console.log(`  Email: ${row[4] || '(empty)'}`);
    console.log(`  Status: ${row[9] || '(empty)'}`);
  }
  
  // Count leads by status
  const statusCounts = {};
  let needsEnrichment = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const status = rows[i][9] || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    const contact = rows[i][2] || '';
    const email = rows[i][4] || '';
    const hasNoContact = !contact || contact.trim() === '';
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    if ((hasNoContact || hasGenericEmail) && status !== 'Dead' && status !== 'Enriched') {
      needsEnrichment++;
    }
  }
  
  console.log('\n=== Status Breakdown ===');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  console.log(`\n=== Enrichment Needs ===`);
  console.log(`Leads needing enrichment: ${needsEnrichment}`);
}

checkSheet().catch(console.error);
