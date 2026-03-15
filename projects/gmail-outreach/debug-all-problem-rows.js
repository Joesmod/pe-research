const { google } = require('googleapis');

async function debugRows() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read header
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:P1'
  });
  const header = headerRes.data.values[0];
  
  // Problem rows from enrichment-candidates file
  const problemRows = [176, 234, 285, 305, 493, 276];
  
  for (const rowNum of problemRows) {
    const rowRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Sheet1!A${rowNum}:P${rowNum}`
    });
    const row = rowRes.data.values ? rowRes.data.values[0] : [];
    
    console.log(`\n=== ROW ${rowNum}: ${row[0] || '(empty)'} ===\n`);
    
    console.log('A (Company):', row[0] || '(empty)');
    console.log('B (NotebookLM):', row[1] || '(empty)');
    console.log('C (Contact Name):', row[2] || '(empty)');
    console.log('D (Title):', row[3] || '(empty)');
    console.log('E (Email):', row[4] || '(empty)');
    console.log('F (Website):', row[5] || '(empty)');
    console.log('G (LinkedIn):', row[6] || '(empty)');
    console.log('H (Sector Focus):', row[7] || '(empty)');
    console.log('I (Portfolio Companies):', row[8] || '(empty)');
    console.log('J (Status):', row[9] || '(empty)');
    console.log('');
    
    // Check for issues
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    
    const issues = [];
    if (!contact || contact.trim() === '') issues.push('Empty contact');
    if (!email || email.trim() === '') issues.push('Empty email');
    if (email && email.includes('@') && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('sales@')
    )) issues.push('Generic email');
    
    // Check if data is misaligned (email in title column)
    if (title && title.includes('@') && (!email || !email.includes('@'))) {
      issues.push('❌ MISALIGNED: Email in Title column!');
    }
    
    if (issues.length > 0) {
      console.log('🚨 Issues:', issues.join(', '));
    } else {
      console.log('✓ No issues detected');
    }
  }
}

debugRows().catch(console.error);
