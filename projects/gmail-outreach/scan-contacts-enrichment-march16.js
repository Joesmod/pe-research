const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

// Contacts sheet columns
const COL = {
  COMPANY: 0,
  SCORE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  EMAIL_STATUS: 5,
  LINKEDIN: 6,
  NOTES: 7,
};

async function scanContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Contacts!A:Z',
  });
  
  const rows = res.data.values || [];
  const headers = rows[0] || [];
  
  console.log(`📊 Total rows in Contacts: ${rows.length}`);
  console.log(`📋 Headers: ${headers.join(' | ')}\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const emailStatus = (row[COL.EMAIL_STATUS] || '').trim().toLowerCase();
    
    if (!company) continue;
    
    const needsEnrich = (
      !contact ||  // Empty contact name
      !email ||    // No email
      (email && GENERIC_PATTERNS.test(email)) ||  // Generic email
      emailStatus === 'unverified' ||  // Unverified
      emailStatus === 'pending'  // Pending verification
    );
    
    if (needsEnrich) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        emailStatus,
        issue: !contact ? 'Empty contact' : !email ? 'Empty email' : GENERIC_PATTERNS.test(email) ? 'Generic email' : 'Unverified email',
      });
    }
  }
  
  console.log(`🎯 Found ${needsEnrichment.length} contacts needing enrichment/verification\n`);
  
  // Show by category
  const byIssue = {};
  needsEnrichment.forEach(l => {
    if (!byIssue[l.issue]) byIssue[l.issue] = [];
    byIssue[l.issue].push(l);
  });
  
  Object.keys(byIssue).forEach(issue => {
    console.log(`\n📋 ${issue}: ${byIssue[issue].length} contacts`);
    byIssue[issue].slice(0, 5).forEach(l => {
      console.log(`  Row ${l.row}: ${l.company} | ${l.contact || '(none)'} | ${l.email || '(none)'} | Status: ${l.emailStatus}`);
    });
  });
  
  // Save to JSON
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'contacts-enrichment-targets-march16-907pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  console.log(`\n💾 Saved ${needsEnrichment.length} targets to contacts-enrichment-targets-march16-907pm.json`);
}

scanContacts().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
