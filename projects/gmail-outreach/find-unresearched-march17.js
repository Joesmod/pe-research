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
  
  const categories = {
    unresearched: [],
    emptyContact: [],
    genericEmail: [],
    researched: [],
    enriched: [],
    dead: [],
    sent: [],
    other: [],
  };
  
  // Start from row 2 (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[0] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').toLowerCase();
    
    if (!company) continue;
    
    const hasNoContact = !contact;
    const hasGenericEmail = email && (
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@')
    );
    
    const item = {
      rowNum: i + 1,
      company,
      contact,
      email,
      website: row[5] || row[1] || '',
      status: row[9] || '',
    };
    
    if (status.includes('unresearched')) {
      categories.unresearched.push(item);
    } else if (hasNoContact) {
      categories.emptyContact.push(item);
    } else if (hasGenericEmail) {
      categories.genericEmail.push(item);
    } else if (status.includes('researched')) {
      categories.researched.push(item);
    } else if (status.includes('enriched')) {
      categories.enriched.push(item);
    } else if (status.includes('dead')) {
      categories.dead.push(item);
    } else if (status.includes('sent')) {
      categories.sent.push(item);
    } else {
      categories.other.push(item);
    }
  }
  
  console.log('Sheet Status Breakdown:');
  console.log(`  Unresearched: ${categories.unresearched.length}`);
  console.log(`  Empty Contact: ${categories.emptyContact.length}`);
  console.log(`  Generic Email: ${categories.genericEmail.length}`);
  console.log(`  Researched: ${categories.researched.length}`);
  console.log(`  Enriched: ${categories.enriched.length}`);
  console.log(`  Dead: ${categories.dead.length}`);
  console.log(`  Sent: ${categories.sent.length}`);
  console.log(`  Other/Unknown: ${categories.other.length}`);
  console.log('');
  
  if (categories.unresearched.length > 0) {
    console.log(`First 15 Unresearched rows:\n`);
    categories.unresearched.slice(0, 15).forEach(item => {
      console.log(`Row ${item.rowNum}: ${item.company}`);
      console.log(`  Contact: ${item.contact || '(empty)'}`);
      console.log(`  Email: ${item.email || '(empty)'}`);
      console.log(`  Website: ${item.website}`);
      console.log('');
    });
  }
  
  if (categories.emptyContact.length > 0) {
    console.log(`\nFirst 10 rows with Empty Contact:\n`);
    categories.emptyContact.slice(0, 10).forEach(item => {
      console.log(`Row ${item.rowNum}: ${item.company}`);
      console.log(`  Status: ${item.status}`);
      console.log(`  Website: ${item.website}`);
      console.log('');
    });
  }
  
  if (categories.genericEmail.length > 0) {
    console.log(`\nFirst 10 rows with Generic Email:\n`);
    categories.genericEmail.slice(0, 10).forEach(item => {
      console.log(`Row ${item.rowNum}: ${item.company}`);
      console.log(`  Contact: ${item.contact}`);
      console.log(`  Email: ${item.email}`);
      console.log(`  Status: ${item.status}`);
      console.log('');
    });
  }
}

main().catch(console.error);
