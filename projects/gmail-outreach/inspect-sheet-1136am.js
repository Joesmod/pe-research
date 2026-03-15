const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function readSheet() {
  const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M500',
  });

  const rows = response.data.values || [];
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log('\nTotal rows (including header):', rows.length);
  
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  console.log('\nColumn indices:');
  console.log('Company:', companyIdx);
  console.log('Contact Name:', contactIdx);
  console.log('Email:', emailIdx);
  console.log('Status:', statusIdx);
  
  // Show first 20 rows
  console.log('\n=== FIRST 20 DATA ROWS ===');
  rows.slice(1, 21).forEach((row, idx) => {
    console.log(`\n${idx + 1}. Company: ${row[companyIdx] || '(empty)'}`);
    console.log(`   Contact: ${row[contactIdx] || '(empty)'}`);
    console.log(`   Email: ${row[emailIdx] || '(empty)'}`);
    console.log(`   Status: ${row[statusIdx] || '(empty)'}`);
  });
  
  // Count by status
  const statusCounts = {};
  rows.slice(1).forEach(row => {
    const status = row[statusIdx] || '(empty)';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  console.log('\n=== STATUS BREAKDOWN ===');
  Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
    console.log(`${status}: ${count}`);
  });
}

readSheet().catch(console.error);
