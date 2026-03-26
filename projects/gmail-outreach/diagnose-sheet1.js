const {google} = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function diagnose() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  
  // Get first 10 rows to understand structure
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:O10'
  });
  
  const rows = resp.data.values || [];
  
  console.log('First 10 rows of Sheet1:\n');
  rows.forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`);
    console.log(`  Col A (0): ${row[0] || '(empty)'}`);
    console.log(`  Col B (1): ${row[1] || '(empty)'}`);
    console.log(`  Col C (2): ${row[2] || '(empty)'}`);
    console.log(`  Col D (3): ${row[3] || '(empty)'}`);
    console.log(`  Col E (4): ${row[4] || '(empty)'}`);
    console.log(`  Col F (5): ${row[5] || '(empty)'}`);
    console.log(`  Col G (6): ${row[6] || '(empty)'}`);
    console.log(`  Col H (7): ${row[7] || '(empty)'}`);
    console.log(`  Col N (13): ${row[13] || '(empty)'}`);
    console.log('');
  });
  
  // Now check a larger range to find enrichment opportunities
  const largeResp = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:O200'
  });
  
  const allRows = largeResp.data.values || [];
  let needsEnrich = 0;
  const candidates = [];
  
  // Assume row 1 is data, not headers
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    if (!row) continue;
    
    const company = row[0] || '';  // Column A = Company Name
    const contact = row[2] || '';  // Column C = Contact Name  
    const email = row[4] || '';    // Column E = Email
    const status = (row[7] || '').toLowerCase(); // Column H = Status
    
    if (!company) continue; // Skip empty company rows
    if (status.includes('dead') || status === 'closed') continue;
    
    const needsWork = !contact || 
                     !email || 
                     email.toLowerCase().includes('info@') ||
                     email.toLowerCase().includes('sales@') ||
                     email.toLowerCase().includes('ir@') ||
                     email.toLowerCase().includes('contact@');
    
    if (needsWork) {
      needsEnrich++;
      if (candidates.length < 15) {
        candidates.push({
          rowNum: i + 1,
          company,
          website: row[1] || '',
          contact: contact || '(empty)',
          email: email || '(empty)',
          status: row[7] || ''
        });
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Found ${needsEnrich} firms needing enrichment (first 200 rows)`);
  console.log('='.repeat(60) + '\n');
  
  console.log(`First ${Math.min(15, candidates.length)} candidates:\n`);
  candidates.forEach(c => {
    console.log(`Row ${c.rowNum}: ${c.company}`);
    console.log(`  Website: ${c.website || '(none)'}`);
    console.log(`  Contact: ${c.contact} | Email: ${c.email} | Status: ${c.status}`);
    console.log('');
  });
}

diagnose().catch(console.error);
