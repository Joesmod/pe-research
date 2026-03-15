const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M50'
  });
  
  const rows = res.data.values || [];
  
  console.log('HEADER (row 1):');
  rows[0].forEach((col, idx) => {
    console.log(`  Col ${String.fromCharCode(65 + idx)} (${idx}): ${col}`);
  });
  
  console.log('\n\nSample rows with column details:');
  
  // Show a few specific rows
  const rowsToCheck = [2, 3, 7, 8, 17, 26];
  
  rowsToCheck.forEach(rowNum => {
    if (rows[rowNum - 1]) {
      console.log(`\n--- ROW ${rowNum} ---`);
      const row = rows[rowNum - 1];
      row.forEach((cell, idx) => {
        console.log(`  ${rows[0][idx] || `Col ${idx}`}: ${cell}`);
      });
    }
  });
  
  // Now scan for firms that are marked "Active" or "Enriched" but have data issues
  console.log('\n\n=== FIRMS WITH DATA QUALITY ISSUES ===');
  
  const issues = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Check if email field doesn't look like an email
    const emailLooksWrong = email && !email.includes('@');
    const titleInEmailField = email && (email.includes('CEO') || email.includes('Partner') || email.includes('Director') || email.includes('VP') || email.includes('Managing'));
    
    if (company && emailLooksWrong && titleInEmailField && status !== 'Dead' && status !== 'Dead Lead') {
      issues.push({
        row: i + 1,
        company,
        contact,
        email,
        status
      });
    }
  }
  
  console.log(`\nFound ${issues.length} rows with misaligned data:`);
  issues.slice(0, 10).forEach(issue => {
    console.log(`  Row ${issue.row}: ${issue.company} - "${issue.email}" in email field`);
  });
})();
