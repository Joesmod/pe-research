const { google } = require('googleapis');
const path = require('path');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  
  console.log(`Total rows: ${rows.length}\n`);
  
  const needsEnrichment = [];
  
  // Skip row 0 (mixed header/data), start from row 1
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();      // Column A
    const website = (row[1] || '').trim();      // Column B
    const contact = (row[2] || '').trim();      // Column C
    const title = (row[3] || '').trim();        // Column D
    const email = (row[4] || '').trim();        // Column E
    const status = (row[9] || '').trim().toLowerCase();  // Column J
    
    if (!company) continue;
    if (status === 'dead' || status === 'sent') continue;
    
    const needsEnrich = (
      !contact ||
      !email ||
      GENERIC_PATTERNS.test(email)
    );
    
    if (needsEnrich) {
      needsEnrichment.push({
        row: i + 1,
        company,
        website,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status,
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} firms needing enrichment:\n`);
  
  needsEnrichment.slice(0, 20).forEach(lead => {
    console.log(`Row ${lead.row}: ${lead.company}`);
    console.log(`  Contact: ${lead.contact}`);
    console.log(`  Email: ${lead.email}`);
    console.log(`  Website: ${lead.website || '(empty)'}`);
    console.log(`  Status: ${lead.status || '(empty)'}`);
    console.log('');
  });
  
  if (needsEnrichment.length > 20) {
    console.log(`... and ${needsEnrichment.length - 20} more\n`);
  }
  
  // Count by issue type
  const emptyContact = needsEnrichment.filter(l => !l.contact || l.contact === '(empty)');
  const emptyEmail = needsEnrichment.filter(l => !l.email || l.email === '(empty)');
  const genericEmail = needsEnrichment.filter(l => l.email && l.email !== '(empty)' && GENERIC_PATTERNS.test(l.email));
  const noWebsite = needsEnrichment.filter(l => !l.website || l.website === '(empty)');
  
  console.log('Breakdown:');
  console.log(`  Empty contact name: ${emptyContact.length}`);
  console.log(`  Empty email: ${emptyEmail.length}`);
  console.log(`  Generic email: ${genericEmail.length}`);
  console.log(`  No website (can't enrich): ${noWebsite.length}`);
})();
