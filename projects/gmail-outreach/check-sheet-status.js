const { google } = require('googleapis');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  console.log('Headers:', headers);
  console.log('Total rows:', rows.length);
  
  const statusCol = headers.indexOf('Status');
  const contactCol = headers.indexOf('Contact Name');
  const emailCol = headers.indexOf('Email');
  const companyCol = headers.indexOf('Company Name');
  
  const statusCounts = {};
  let emptyEmailCount = 0;
  let genericEmailCount = 0;
  let emptyContactCount = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = (row[statusCol] || 'No Status').trim();
    const email = row[emailCol] || '';
    const contact = row[contactCol] || '';
    const company = row[companyCol] || '';
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    if (!email) emptyEmailCount++;
    if (email.match(/^(info@|sales@|ir@|contact@)/i)) genericEmailCount++;
    if (!contact || contact === 'Jacob Zodikoff') emptyContactCount++;
  }
  
  console.log('\nStatus breakdown:');
  for (const [status, count] of Object.entries(statusCounts).sort((a,b) => b[1] - a[1])) {
    console.log(`  ${status}: ${count}`);
  }
  
  console.log(`\nEmpty emails: ${emptyEmailCount}`);
  console.log(`Generic emails: ${genericEmailCount}`);
  console.log(`Empty/placeholder contacts: ${emptyContactCount}`);
  
  // Show a few sample rows
  console.log('\nSample rows (first 10 non-Sent/Dead):');
  let count = 0;
  for (let i = 1; i < rows.length && count < 10; i++) {
    const row = rows[i];
    const status = (row[statusCol] || '').toLowerCase();
    
    if (!status.includes('sent') && !status.includes('dead')) {
      console.log(JSON.stringify({
        row: i + 1,
        company: row[companyCol],
        contact: row[contactCol],
        email: row[emailCol],
        status: row[statusCol]
      }, null, 2));
      count++;
    }
  }
}

main().catch(console.error);
