const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function inspect() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read headers and first 20 rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z30',
  });
  
  const [headers, ...rows] = response.data.values;
  
  console.log('=== SHEET HEADERS ===');
  headers.forEach((h, i) => console.log(`${String.fromCharCode(65 + i)}: ${h}`));
  
  console.log('\n=== SAMPLE ROWS (showing first 10) ===');
  
  const colIdx = {
    company: headers.indexOf('Company'),
    contact: headers.indexOf('Contact Name'),
    email: headers.indexOf('Email'),
    title: headers.indexOf('Position/Title'),
    status: headers.indexOf('Status'),
    website: headers.indexOf('Website'),
  };
  
  rows.slice(0, 10).forEach((row, idx) => {
    console.log(`\n--- Row ${idx + 2} ---`);
    console.log(`  Company: ${row[colIdx.company] || '(empty)'}`);
    console.log(`  Contact: ${row[colIdx.contact] || '(empty)'}`);
    console.log(`  Email: ${row[colIdx.email] || '(empty)'}`);
    console.log(`  Title: ${row[colIdx.title] || '(empty)'}`);
    console.log(`  Status: ${row[colIdx.status] || '(empty)'}`);
    console.log(`  Website: ${row[colIdx.website] || '(empty)'}`);
  });
  
  // Count enrichment status
  console.log('\n=== ENRICHMENT ANALYSIS ===');
  let emptyContact = 0;
  let emptyEmail = 0;
  let genericEmail = 0;
  let alreadyEnriched = 0;
  let statusDead = 0;
  let statusSent = 0;
  
  rows.forEach(row => {
    const contact = row[colIdx.contact] || '';
    const email = row[colIdx.email] || '';
    const status = (row[colIdx.status] || '').toLowerCase();
    
    if (status.includes('enriched')) alreadyEnriched++;
    if (status.includes('dead')) statusDead++;
    if (status.includes('sent')) statusSent++;
    
    if (!contact) emptyContact++;
    if (!email) emptyEmail++;
    if (email && /^(info|sales|ir|contact|admin|support|hello)@/i.test(email)) genericEmail++;
  });
  
  console.log(`Total rows: ${rows.length}`);
  console.log(`Empty Contact Name: ${emptyContact}`);
  console.log(`Empty Email: ${emptyEmail}`);
  console.log(`Generic Email: ${genericEmail}`);
  console.log(`Status "Enriched": ${alreadyEnriched}`);
  console.log(`Status "Dead": ${statusDead}`);
  console.log(`Status "Sent": ${statusSent}`);
  
  console.log(`\nPotential enrichment candidates: ${rows.filter((row, idx) => {
    const contact = row[colIdx.contact] || '';
    const email = row[colIdx.email] || '';
    const status = (row[colIdx.status] || '').toLowerCase();
    const website = row[colIdx.website] || '';
    
    const hasGenericEmail = email && /^(info|sales|ir|contact|admin|support|hello)@/i.test(email);
    const needsEnrichment = (!contact || !email || hasGenericEmail) && website;
    const notExcluded = !status.includes('enriched') && !status.includes('dead') && !status.includes('sent');
    
    return needsEnrichment && notExcluded;
  }).length}`);
}

inspect().catch(console.error);
