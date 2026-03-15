const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = './service-account.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read first 50 rows to understand structure
  console.log('📊 Reading first 50 rows from Sheet1...\n');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:O50',
  });

  const rows = response.data.values;
  
  console.log('Total rows:', rows.length);
  console.log('\n--- Row by row inspection ---\n');
  
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    console.log(`Row ${i + 1}:`);
    console.log(`  Company (A): ${row[0] || '(empty)'}`);
    console.log(`  Col B: ${row[1] || '(empty)'}`);
    console.log(`  Contact (C): ${row[2] || '(empty)'}`);
    console.log(`  Title (D): ${row[3] || '(empty)'}`);
    console.log(`  Email (E): ${row[4] || '(empty)'}`);
    console.log(`  Status (H): ${row[7] || '(empty)'}`);
    console.log('');
  }
  
  // Check for empty or generic emails
  console.log('\n--- Firms with empty or generic emails (rows 1-50) ---\n');
  let count = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    
    if (!company.trim()) continue;
    
    const emptyContact = !contact.trim();
    const genericEmail = email.match(/^(info@|sales@|ir@|contact@|inquiries@|hello@|support@|team@|admin@)/i);
    const emptyEmail = !email.trim();
    
    if (emptyContact || genericEmail || emptyEmail) {
      count++;
      console.log(`${count}. Row ${i + 1}: ${company}`);
      console.log(`   Contact: ${contact || '(EMPTY)'}`);
      console.log(`   Email: ${email || '(EMPTY)'}`);
      console.log('');
    }
  }
  
  console.log(`Total in first 50 rows needing enrichment: ${count}`);
}

main().catch(console.error);
