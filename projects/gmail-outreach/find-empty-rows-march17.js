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
  
  console.log(`Total rows in sheet: ${rows.length}\n`);
  
  const emptyContacts = [];
  
  // Start from row 2 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').toLowerCase();
    
    if (!company) continue; // Skip rows with no company
    if (status === 'dead' || status === 'sent') continue; // Skip dead/sent
    
    const hasNoContact = !contact;
    const hasGenericEmail = email && (
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@')
    );
    
    if (hasNoContact || hasGenericEmail) {
      emptyContacts.push({
        rowNum: i + 1,
        company,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status,
      });
    }
  }
  
  console.log(`Rows needing enrichment: ${emptyContacts.length}\n`);
  console.log('First 15 rows:\n');
  
  emptyContacts.slice(0, 15).forEach(item => {
    console.log(`Row ${item.rowNum}: ${item.company}`);
    console.log(`  Contact: ${item.contact}`);
    console.log(`  Email: ${item.email}`);
    console.log(`  Status: ${item.status || '(empty)'}`);
    console.log('');
  });
}

main().catch(console.error);
