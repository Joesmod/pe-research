const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// Column indices (0-based, no header row)
const COLS = {
  COMPANY: 0,      // A: Company Name
  WEBSITE: 1,      // B: Website
  CONTACT: 2,      // C: Contact Name
  TITLE: 3,        // D: Title/Position
  EMAIL: 4,        // E: Email
  EXTRA: 5,        // F: Extra field
  LINKEDIN: 6,     // G: LinkedIn URL
  STATUS1: 7,      // H: Status (first)
  NOTES: 8,        // I: Notes
  STATUS2: 9,      // J: Status (second)
  LAST_CONTACT: 10 // K: Last Contacted
};

async function main() {
  console.log('=== PE Research & Enrichment - Proper Version ===');
  console.log('Time:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  
  try {
    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read the sheet
    console.log('\n[1/4] Reading Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }

    console.log(`Total rows: ${rows.length}`);

    // Identify leads needing enrichment
    console.log('\n[2/4] Identifying leads needing enrichment...');
    const needsEnrichment = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const company = row[COLS.COMPANY] || '';
      const contact = row[COLS.CONTACT] || '';
      const email = row[COLS.EMAIL] || '';
      const status1 = row[COLS.STATUS1] || '';
      const status2 = row[COLS.STATUS2] || '';

      // Skip if company name is empty or looks like a header
      if (!company || company === 'Company Name') continue;

      // Skip if Dead/Bounced
      if (status1 === 'Dead' || status1 === 'Bounced' || 
          status2 === 'Dead' || status2 === 'Bounced') {
        continue;
      }

      // Needs enrichment if:
      // 1. No contact name OR
      // 2. Generic email (info@, sales@, ir@, contact@)
      const hasGenericEmail = email && (
        email.toLowerCase().includes('info@') || 
        email.toLowerCase().includes('sales@') || 
        email.toLowerCase().includes('ir@') ||
        email.toLowerCase().includes('contact@')
      );
      
      const needsContact = !contact || !contact.trim() || contact === 'Contact Name';
      const needsRealEmail = !email || !email.trim() || hasGenericEmail;

      if (needsContact || needsRealEmail) {
        needsEnrichment.push({
          rowIndex: i + 1,  // 1-based for sheet
          company,
          contact,
          email,
          website: row[COLS.WEBSITE] || '',
          needsContact,
          needsRealEmail,
        });
      }
    }

    console.log(`Found ${needsEnrichment.length} leads needing enrichment:`);
    
    // Show first 20
    console.log('\nFirst 20 leads needing enrichment:');
    needsEnrichment.slice(0, 20).forEach((lead, idx) => {
      const issues = [];
      if (lead.needsContact) issues.push('no contact');
      if (lead.needsRealEmail) issues.push('generic/no email');
      console.log(`  ${idx + 1}. ${lead.company} (Row ${lead.rowIndex}) - ${issues.join(', ')}`);
    });
    
    if (needsEnrichment.length === 0) {
      console.log('✅ All leads are enriched!');
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalRows: rows.length,
        needsEnrichment: 0,
        message: 'All leads have contact names and verified emails',
      };
      
      fs.writeFileSync(
        path.join(__dirname, 'enrichment-targets-march16-1207am.json'),
        JSON.stringify(summary, null, 2)
      );
      
      return;
    }

    // Select top 10-15 for this run
    const targetCount = Math.min(15, needsEnrichment.length);
    const targets = needsEnrichment.slice(0, targetCount);
    
    console.log(`\n[3/4] Target ${targets.length} firms for enrichment:`);
    targets.forEach((t, idx) => {
      console.log(`  ${idx + 1}. ${t.company} (Row ${t.rowIndex})`);
      console.log(`      Website: ${t.website || 'Not listed'}`);
      console.log(`      Current contact: ${t.contact || '(empty)'}`);
      console.log(`      Current email: ${t.email || '(empty)'}`);
    });

    // Save targets to file
    const targetFile = path.join(__dirname, 'enrichment-targets-march16-1207am.json');
    fs.writeFileSync(targetFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalNeedingEnrichment: needsEnrichment.length,
      targetedThisRun: targets.length,
      targets,
    }, null, 2));
    
    console.log(`\n[4/4] Targets saved to: ${targetFile}`);
    console.log('\n🔍 Research Instructions:');
    console.log('For each firm above, manually research and find:');
    console.log('  • C-level: CEO, CTO, COO, CMO, CFO');
    console.log('  • Partners: Managing, Operating, General Partner');
    console.log('  • Directors: Technology, Product, Operations, Marketing, BD');
    console.log('  • VPs: Technology, Operations, Digital Transformation');
    console.log('  • Heads of: Value Creation, Portfolio Operations');
    console.log('\n📍 Search Methods:');
    console.log('  1. Firm website team/about/contact pages');
    console.log('  2. LinkedIn: site:linkedin.com/in "Company Name" partner');
    console.log('  3. Press releases, conference bios');
    console.log('  4. SEC filings (for larger firms)');
    console.log('\n⚠️  Rules:');
    console.log('  • ONLY use emails found on official published sources');
    console.log('  • NEVER guess email patterns');
    console.log('  • Document source in Notes column');
    console.log('  • Set Status to "Enriched" when complete');
    
    console.log(`\n✅ Scan complete!`);
    console.log(`📊 ${needsEnrichment.length} leads need enrichment`);
    console.log(`🎯 ${targets.length} selected for this run`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();
