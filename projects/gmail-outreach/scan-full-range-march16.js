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

async function scan() {
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
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim().toLowerCase();
    const website = (row[COL.WEBSITE] || '').trim();
    
    if (!company) continue;
    if (status === 'dead' || status === 'sent') continue;
    if (!website || !website.startsWith('http')) continue;
    
    const needsEnrich = (
      !contact ||
      !email ||
      GENERIC_PATTERNS.test(email)
    );
    
    if (needsEnrich) {
      needsEnrichment.push({
        row: i + 1,
        company,
        contact,
        email,
        status,
        website: website.substring(0, 50),
        issue: !contact ? 'Empty contact' : !email ? 'Empty email' : 'Generic email',
      });
    }
  }
  
  console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 20
  console.log(`📝 First 20 leads needing enrichment:\n`);
  needsEnrichment.slice(0, 20).forEach(l => {
    console.log(`Row ${l.row}: ${l.company}`);
    console.log(`  Issue: ${l.issue}`);
    console.log(`  Website: ${l.website}`);
    console.log(`  Current: ${l.contact || '(none)'} - ${l.email || '(none)'}`);
    console.log('');
  });
  
  // Save list to JSON
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march16-907pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  console.log(`💾 Saved ${needsEnrichment.length} targets to enrichment-targets-march16-907pm.json`);
}

scan().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
