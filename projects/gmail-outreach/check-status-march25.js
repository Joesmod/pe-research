const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:P50',  // First 50 data rows
  });
  
  const rows = response.data.values || [];
  
  console.log('Analyzing first 50 rows...\n');
  
  let emptyContact = 0;
  let emptyEmail = 0;
  let genericEmail = 0;
  let statusBreakdown = {};
  
  rows.forEach((row, i) => {
    const company = (row[0] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim();
    
    if (!company) return;
    
    if (!contactName) emptyContact++;
    if (!email) emptyEmail++;
    
    if (email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@')
    )) {
      genericEmail++;
    }
    
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    
    // Show first 5 with any issues
    if ((i < 5 && (!contactName || !email)) || (i < 10 && email.startsWith('info@'))) {
      console.log(`Row ${i + 2}: ${company}`);
      console.log(`  Contact: ${contactName || '(EMPTY)'}`);
      console.log(`  Email: ${email || '(EMPTY)'}`);
      console.log(`  Status: ${status || '(EMPTY)'}`);
      console.log('');
    }
  });
  
  console.log('\nSummary:');
  console.log(`Empty contact name: ${emptyContact}`);
  console.log(`Empty email: ${emptyEmail}`);
  console.log(`Generic email: ${genericEmail}`);
  console.log('\nStatus breakdown:');
  Object.entries(statusBreakdown).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`  ${status || '(empty)'}: ${count}`);
  });
}

main().catch(console.error);
