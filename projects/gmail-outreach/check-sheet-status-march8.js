const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('📊 Checking Sheet Status - March 8, 5:06 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1);

  console.log('Headers:', headers.join(' | '));
  console.log(`\nTotal rows: ${data.length}\n`);

  const colMap = {};
  headers.forEach((h, i) => { colMap[h] = i; });

  // Status breakdown
  const statusCount = {};
  const emptyContact = [];
  const genericEmail = [];

  data.forEach((row, idx) => {
    const status = row[colMap['Status']] || '(empty)';
    statusCount[status] = (statusCount[status] || 0) + 1;

    const company = row[colMap['Company']] || '';
    const contactName = row[colMap['Contact Name']] || '';
    const email = row[colMap['Email']] || '';

    if (company && !contactName && status !== 'Dead') {
      emptyContact.push({ company, email, status, row: idx + 2 });
    }

    if (company && email && /^(info|sales|ir|contact|admin|support|hello)@/i.test(email) && status !== 'Dead') {
      genericEmail.push({ company, email, status, row: idx + 2 });
    }
  });

  console.log('📋 Status Breakdown:');
  Object.keys(statusCount).sort((a,b) => statusCount[b] - statusCount[a]).forEach(s => {
    console.log(`  ${s}: ${statusCount[s]}`);
  });

  console.log(`\n🔍 Leads with EMPTY Contact Name (not Dead): ${emptyContact.length}`);
  if (emptyContact.length > 0) {
    console.log('First 15:');
    emptyContact.slice(0, 15).forEach(({ company, email, status, row }) => {
      console.log(`  Row ${row}: ${company} | ${email || '(no email)'} | Status: ${status}`);
    });
  }

  console.log(`\n📧 Leads with GENERIC Email (not Dead): ${genericEmail.length}`);
  if (genericEmail.length > 0) {
    console.log('First 15:');
    genericEmail.slice(0, 15).forEach(({ company, email, status, row }) => {
      console.log(`  Row ${row}: ${company} | ${email} | Status: ${status}`);
    });
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
