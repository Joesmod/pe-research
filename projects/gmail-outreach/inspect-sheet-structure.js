const { google } = require('googleapis');

async function inspect() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:M'
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  console.log('=== SHEET STRUCTURE ===\n');
  console.log('Headers:', rows[0]);
  console.log('\n=== SAMPLE ROWS (first 10) ===\n');
  
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    console.log(`  Company: ${row[0] || '[EMPTY]'}`);
    console.log(`  Contact: ${row[2] || '[EMPTY]'}`);
    console.log(`  Email: ${row[4] || '[EMPTY]'}`);
    console.log(`  Status: ${row[9] || '[EMPTY]'}`);
  }
  
  console.log('\n=== STATUS BREAKDOWN ===\n');
  const statusCounts = {};
  for (let i = 1; i < rows.length; i++) {
    const status = rows[i][9] || 'No Status';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`${status}: ${count}`);
  });
  
  console.log(`\n\nTotal rows: ${rows.length - 1}`);
}

inspect().catch(console.error);
