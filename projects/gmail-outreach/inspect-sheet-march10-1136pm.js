const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function inspectSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found in sheet.');
    return;
  }

  const headers = rows[0];
  console.log(`\n📊 Sheet Structure:`);
  console.log(`Total rows: ${rows.length}`);
  console.log(`\n📑 Headers (${headers.length}):`);
  headers.forEach((h, idx) => console.log(`  [${idx}] ${h}`));

  // Sample 10 rows to understand data
  console.log(`\n📋 Sample rows (first 10 data rows):`);
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    headers.forEach((h, idx) => {
      if (row[idx]) {
        console.log(`  ${h}: ${row[idx]}`);
      }
    });
  }

  // Count empty fields
  const companyIdx = headers.findIndex(h => h.toLowerCase().includes('company'));
  const contactIdx = headers.findIndex(h => h.toLowerCase().includes('contact'));
  const emailIdx = headers.findIndex(h => h.toLowerCase().includes('email'));
  const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status'));

  console.log(`\n🔍 Column indices:`);
  console.log(`  Company: ${companyIdx} (${headers[companyIdx]})`);
  console.log(`  Contact: ${contactIdx} (${headers[contactIdx]})`);
  console.log(`  Email: ${emailIdx} (${headers[emailIdx]})`);
  console.log(`  Status: ${statusIdx} (${headers[statusIdx]})`);

  let emptyContacts = 0;
  let emptyEmails = 0;
  let genericEmails = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    
    if (!contact.trim()) emptyContacts++;
    if (!email.trim()) emptyEmails++;
    
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];
    if (genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix))) {
      genericEmails++;
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`  Empty contact names: ${emptyContacts}`);
  console.log(`  Empty emails: ${emptyEmails}`);
  console.log(`  Generic emails: ${genericEmails}`);
  console.log(`  Total needing enrichment: ${Math.max(emptyContacts, emptyEmails + genericEmails)}`);
}

inspectSheet()
  .then(() => console.log('\n✅ Inspection complete'))
  .catch(err => console.error('❌ Error:', err));
