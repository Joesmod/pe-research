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

async function diagnose() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:Z',
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 Total rows: ${rows.length}\n`);
  
  // Categorize leads
  const categories = {
    emptyContact: [],
    emptyEmail: [],
    genericEmail: [],
    fullyEnriched: [],
    noWebsite: [],
    dead: [],
  };
  
  for (let i = 0; i < Math.min(rows.length, 100); i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim().toLowerCase();
    const website = (row[COL.WEBSITE] || '').trim();
    
    if (!company) continue;
    
    const lead = {
      row: i + 1,
      company,
      contact,
      email,
      status,
      website: website.substring(0, 40),
    };
    
    if (status === 'dead' || status === 'sent') {
      categories.dead.push(lead);
    } else if (!website || !website.startsWith('http')) {
      categories.noWebsite.push(lead);
    } else if (!contact) {
      categories.emptyContact.push(lead);
    } else if (!email) {
      categories.emptyEmail.push(lead);
    } else if (GENERIC_PATTERNS.test(email)) {
      categories.genericEmail.push(lead);
    } else {
      categories.fullyEnriched.push(lead);
    }
  }
  
  console.log(`📋 ENRICHMENT STATUS (first 100 rows):\n`);
  console.log(`✅ Fully enriched: ${categories.fullyEnriched.length}`);
  console.log(`📧 Generic email: ${categories.genericEmail.length}`);
  console.log(`❌ Empty contact: ${categories.emptyContact.length}`);
  console.log(`❌ Empty email: ${categories.emptyEmail.length}`);
  console.log(`🌐 No website: ${categories.noWebsite.length}`);
  console.log(`💀 Dead/Sent: ${categories.dead.length}`);
  
  console.log(`\n🔍 EMPTY CONTACT (first 10):`);
  categories.emptyContact.slice(0, 10).forEach(l => {
    console.log(`  Row ${l.row}: ${l.company} | ${l.website} | Status: ${l.status}`);
  });
  
  console.log(`\n🔍 GENERIC EMAIL (first 10):`);
  categories.genericEmail.slice(0, 10).forEach(l => {
    console.log(`  Row ${l.row}: ${l.company} | ${l.contact} | ${l.email} | ${l.website}`);
  });
  
  console.log(`\n🔍 EMPTY EMAIL (first 10):`);
  categories.emptyEmail.slice(0, 10).forEach(l => {
    console.log(`  Row ${l.row}: ${l.company} | ${l.contact} | ${l.website}`);
  });
}

diagnose().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
