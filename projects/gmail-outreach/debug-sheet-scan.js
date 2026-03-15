const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O'
  });
  
  const rows = response.data.values || [];
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log('\nColumn indices:');
  headers.forEach((h, idx) => console.log(`  ${idx}: ${h}`));
  
  console.log('\n\nFirst 10 data rows:');
  for (let i = 1; i <= Math.min(10, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    headers.forEach((h, idx) => {
      console.log(`  ${h}: "${row[idx] || ''}"`);
    });
  }
  
  // Check for empty contacts/generic emails
  const companyIdx = headers.indexOf('Company/Firm');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  let emptyContact = 0;
  let emptyEmail = 0;
  let genericEmail = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = (row[statusIdx] || '').toLowerCase();
    
    if (!company || status === 'dead' || status === 'researched - dead' || status === 'closed') continue;
    
    if (!contact) emptyContact++;
    if (!email) emptyEmail++;
    if (email && (email.includes('@info') || email.includes('@sales') || email.includes('@ir') || email.includes('@contact'))) genericEmail++;
  }
  
  console.log(`\n\n=== STATS ===`);
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Empty contact names: ${emptyContact}`);
  console.log(`Empty emails: ${emptyEmail}`);
  console.log(`Generic emails: ${genericEmail}`);
  console.log(`Need enrichment: ${emptyContact + emptyEmail + genericEmail}`);
}

run().catch(console.error);
