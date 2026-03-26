const { google } = require('googleapis');

async function inspectSample() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000',
  });

  const rows = response.data.values;
  
  console.log('Headers (Row 1):');
  console.log(rows[0]);
  
  console.log('\n=== Sample rows (rows 2-12) ===');
  for (let i = 1; i < Math.min(12, rows.length); i++) {
    const row = rows[i] || [];
    console.log(`\nRow ${i + 1}:`);
    console.log(`  Company: ${row[0]}`);
    console.log(`  Website: ${row[1]}`);
    console.log(`  Contact: ${row[2]}`);
    console.log(`  Title: ${row[3]}`);
    console.log(`  Email: ${row[4]}`);
    console.log(`  LinkedIn: ${row[6]}`);
    console.log(`  Status H: ${row[7]}`);
    console.log(`  Status J: ${row[9]}`);
  }

  // Count by status
  let statusCounts = {};
  for (let i = 1; i < rows.length; i++) {
    const status = (rows[i][7] || '').trim() || (rows[i][9] || '').trim() || '(empty)';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  console.log('\n=== Status distribution ===');
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`${status}: ${count}`);
  });

  // Look for rows without "Enriched" status
  let notEnriched = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const status = (row[7] || '').trim();
    const statusAlt = (row[9] || '').trim();
    
    if (!company) continue;
    
    if (status !== 'Enriched' && statusAlt !== 'Enriched' && status !== 'Dead' && statusAlt !== 'Dead') {
      notEnriched.push({
        row: i + 1,
        company,
        contact: row[2],
        email: row[4],
        status: status || statusAlt || '(none)'
      });
    }
  }

  console.log(`\n=== Non-Enriched leads (first 20) ===`);
  notEnriched.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company} | Status: ${lead.status} | Contact: ${lead.contact || '(empty)'} | Email: ${lead.email || '(empty)'}`);
  });
}

inspectSample().catch(console.error);
