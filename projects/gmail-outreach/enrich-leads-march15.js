const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

// Column indices (0-based)
const COLS = {
  COMPANY: 0,    // A
  WEBSITE: 1,    // B
  CONTACT: 2,    // C
  TITLE: 3,      // D
  EMAIL: 4,      // E
  ALT: 5,        // F
  LINKEDIN: 6,   // G
  STATUS: 7,     // H
  NOTES1: 8,     // I
  STATUS2: 9,    // J
  DATE: 10,      // K
  NOTES2: 11,    // L
  INFO_URL: 12,  // M
  SCORE: 13      // N
};

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read all data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:O'
    });
    
    const rows = response.data.values || [];
    
    const needsEnrichment = [];
    
    // Start from row 2 (index 1) - skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const company = (row[COLS.COMPANY] || '').trim();
      const contact = (row[COLS.CONTACT] || '').trim();
      const email = (row[COLS.EMAIL] || '').trim();
      const status = (row[COLS.STATUS] || '').toLowerCase();
      const status2 = (row[COLS.STATUS2] || '').toLowerCase();
      
      // Skip dead/closed firms
      if (status.includes('dead') || status2.includes('dead') || status.includes('closed')) {
        continue;
      }
      
      // Check if needs enrichment
      const needsContact = !contact || contact.length < 3;
      const hasGenericEmail = email.includes('info@') || 
                              email.includes('sales@') || 
                              email.includes('ir@') || 
                              email.includes('contact@') ||
                              email.includes('investor@');
      const needsEmail = !email || hasGenericEmail;
      
      if ((needsContact || needsEmail) && company && company !== 'Company Name') {
        needsEnrichment.push({
          rowNum: i + 1,
          company,
          website: row[COLS.WEBSITE] || '',
          contact: contact || '(empty)',
          title: row[COLS.TITLE] || '',
          email: email || '(empty)',
          status: row[COLS.STATUS] || '',
          needsContact,
          needsEmail
        });
      }
    }
    
    console.log(`\n📊 Found ${needsEnrichment.length} leads needing enrichment\n`);
    
    // Show top 15
    const top15 = needsEnrichment.slice(0, 15);
    top15.forEach((lead, idx) => {
      const issues = [];
      if (lead.needsContact) issues.push('NO CONTACT');
      if (lead.needsEmail) issues.push(lead.email === '(empty)' ? 'NO EMAIL' : 'GENERIC EMAIL');
      console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
      console.log(`   ${issues.join(' | ')} | Contact: ${lead.contact} | Email: ${lead.email}`);
      console.log(`   Website: ${lead.website}`);
      console.log('');
    });
    
    // Save to file
    const outputFile = path.join(__dirname, 'enrichment-targets-march15-run.json');
    fs.writeFileSync(outputFile, JSON.stringify(top15, null, 2));
    console.log(`\n💾 Saved ${top15.length} targets to enrichment-targets-march15-run.json`);
    
    return top15;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

run().then(results => {
  console.log(`\n✅ Ready to enrich ${results?.length || 0} leads.`);
  console.log('\n📌 Next step: Research these firms to find decision-makers with direct emails.');
  console.log('   Focus on: C-level, Partners, Directors, VPs, Heads of departments');
  console.log('   Sources: firm websites, LinkedIn, press releases, SEC filings\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
