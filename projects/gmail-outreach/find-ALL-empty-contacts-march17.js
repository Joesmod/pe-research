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
  const genericEmails = [];
  
  // Start from row 2 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const website = (row[5] || '').trim();
    const status = (row[9] || '').toLowerCase();
    
    if (!company) continue; // Skip rows with no company
    
    const hasNoContact = !contact;
    const hasGenericEmail = email && (
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@')
    );
    
    if (hasNoContact) {
      emptyContacts.push({
        rowNum: i + 1,
        company,
        website,
        email,
        status,
      });
    } else if (hasGenericEmail) {
      genericEmails.push({
        rowNum: i + 1,
        company,
        contact,
        website,
        email,
        status,
      });
    }
  }
  
  console.log(`Rows with NO contact: ${emptyContacts.length}`);
  console.log(`Rows with GENERIC emails: ${genericEmails.length}`);
  console.log(`Total needing enrichment: ${emptyContacts.length + genericEmails.length}\n`);
  
  console.log('First 15 rows with NO contact:\n');
  emptyContacts.slice(0, 15).forEach(item => {
    console.log(`Row ${item.rowNum}: ${item.company}`);
    console.log(`  Email: ${item.email || '(empty)'}`);
    console.log(`  Website: ${item.website || '(empty)'}`);
    console.log(`  Status: ${item.status || '(empty)'}`);
    console.log('');
  });
}

main().catch(console.error);
