const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function readSheet() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  return response.data.values || [];
}

async function main() {
  const rows = await readSheet();
  
  console.log(`Checking rows with Other/Unknown status:\n`);
  
  const otherStatus = [];
  
  // Start from row 2 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').toLowerCase();
    
    if (!company) continue;
    
    const isKnownStatus = 
      status.includes('unresearched') ||
      status.includes('researched') ||
      status.includes('enriched') ||
      status.includes('dead') ||
      status.includes('sent');
    
    if (!isKnownStatus) {
      otherStatus.push({
        rowNum: i + 1,
        company,
        contact: contact || '(empty)',
        email: email || '(empty)',
        website: row[5] || row[1] || '',
        status: row[9] || '(empty)',
      });
    }
  }
  
  console.log(`Total Other/Unknown status: ${otherStatus.length}\n`);
  console.log('First 20 rows:\n');
  
  otherStatus.slice(0, 20).forEach(item => {
    console.log(`Row ${item.rowNum}: ${item.company}`);
    console.log(`  Contact: ${item.contact}`);
    console.log(`  Email: ${item.email}`);
    console.log(`  Status: "${item.status}"`);
    console.log(`  Website: ${item.website}`);
    console.log('');
  });
  
  // Check for empty contacts in "Other" status
  const emptyInOther = otherStatus.filter(item => item.contact === '(empty)');
  console.log(`\nRows with empty contact in Other status: ${emptyInOther.length}`);
  
  if (emptyInOther.length > 0) {
    console.log('\nFirst 10:\n');
    emptyInOther.slice(0, 10).forEach(item => {
      console.log(`Row ${item.rowNum}: ${item.company}`);
      console.log(`  Website: ${item.website}`);
      console.log(`  Status: "${item.status}"`);
      console.log('');
    });
  }
}

main().catch(console.error);
