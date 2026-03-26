const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

const COL = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  LINKEDIN: 6,
  STATUS: 7,
  NOTES: 8,
};

async function checkNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  console.log(`Total rows: ${rows.length}\n`);
  
  const statusCounts = {};
  let emptyContact = 0;
  let emptyEmail = 0;
  let genericEmail = 0;
  let hasWebsite = 0;
  
  const examples = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const website = (row[COL.WEBSITE] || '').trim();
    const status = (row[COL.STATUS] || '').trim();
    
    if (!company) continue;
    
    // Count statuses
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    // Check conditions
    if (!contact || contact.length < 3) emptyContact++;
    if (!email) emptyEmail++;
    if (email && GENERIC_PATTERNS.test(email)) genericEmail++;
    if (website) hasWebsite++;
    
    // Collect examples needing enrichment
    if ((!contact || !email || GENERIC_PATTERNS.test(email)) && website && examples.length < 20) {
      examples.push({
        row: i + 1,
        company,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status,
        website: website.substring(0, 40),
      });
    }
  }
  
  console.log(`📊 Statistics:`);
  console.log(`  Empty/short contact: ${emptyContact}`);
  console.log(`  Empty email: ${emptyEmail}`);
  console.log(`  Generic email: ${genericEmail}`);
  console.log(`  Has website: ${hasWebsite}`);
  
  console.log(`\n📈 Status breakdown:`);
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      console.log(`  "${status}": ${count}`);
    });
  
  console.log(`\n🔍 First 20 candidates needing enrichment:\n`);
  examples.forEach((ex, idx) => {
    console.log(`${idx + 1}. Row ${ex.row}: ${ex.company}`);
    console.log(`   Contact: ${ex.contact} | Email: ${ex.email}`);
    console.log(`   Status: "${ex.status}" | Website: ${ex.website}`);
    console.log();
  });
}

checkNeeds().catch(console.error);
