const { google } = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });
  
  const allRows = result.data.values;
  if (!allRows || allRows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = allRows[0];
  const rows = allRows.slice(1);
  
  console.log(`Total rows: ${rows.length}`);
  console.log(`Headers: ${headers.join(' | ')}\n`);
  
  // Priority 1: Researched but no public email found
  const noPublicEmail = rows.filter(row => {
    const company = row[0] || '';
    const status = row[7] || '';
    return company && status.toLowerCase().includes('no public email');
  });
  
  // Priority 2: Empty contact name but has website
  const emptyContact = rows.filter(row => {
    const company = row[0] || '';
    const contact = row[2] || '';
    const website = row[1] || '';
    const status = row[7] || '';
    const skipStatuses = ['Dead', 'Sent', 'Bounced', 'Replied'];
    return company && !contact && website && !skipStatuses.includes(status);
  });
  
  // Priority 3: Generic emails (info@, sales@, etc.)
  const genericEmails = rows.filter(row => {
    const company = row[0] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    const skipStatuses = ['Dead', 'Sent', 'Bounced', 'Replied'];
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|admin|inquiries)@/i);
    return company && hasGenericEmail && !skipStatuses.includes(status);
  });
  
  console.log('=== PRIORITY 1: Researched - No Public Email Found ===');
  console.log(`Count: ${noPublicEmail.length}\n`);
  noPublicEmail.slice(0, 10).forEach((row, idx) => {
    console.log(`${idx + 1}. ${row[0]}`);
    console.log(`   Website: ${row[1] || '[EMPTY]'}`);
    console.log(`   Contact: ${row[2] || '[EMPTY]'}`);
    console.log(`   Email: ${row[4] || '[EMPTY]'}`);
    console.log(`   Status: ${row[7] || '[EMPTY]'}\n`);
  });
  
  console.log('\n=== PRIORITY 2: Empty Contact Name (with website) ===');
  console.log(`Count: ${emptyContact.length}\n`);
  emptyContact.slice(0, 5).forEach((row, idx) => {
    console.log(`${idx + 1}. ${row[0]}`);
    console.log(`   Website: ${row[1] || '[EMPTY]'}`);
    console.log(`   Status: ${row[7] || '[EMPTY]'}\n`);
  });
  
  console.log('\n=== PRIORITY 3: Generic Emails ===');
  console.log(`Count: ${genericEmails.length}\n`);
  genericEmails.slice(0, 5).forEach((row, idx) => {
    console.log(`${idx + 1}. ${row[0]}`);
    console.log(`   Email: ${row[4]}`);
    console.log(`   Website: ${row[1] || '[EMPTY]'}`);
    console.log(`   Status: ${row[7] || '[EMPTY]'}\n`);
  });
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total enrichment opportunities: ${noPublicEmail.length + emptyContact.length + genericEmails.length}`);
  console.log(`- No public email: ${noPublicEmail.length}`);
  console.log(`- Empty contact: ${emptyContact.length}`);
  console.log(`- Generic emails: ${genericEmails.length}`);
}

main().catch(console.error);
