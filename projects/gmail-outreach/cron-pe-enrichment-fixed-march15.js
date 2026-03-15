const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

// Based on actual sheet structure from debug
const COLUMNS = {
  company: 0,      // Company Name
  website: 1,      // NotebookLM (actually Website)
  contact: 2,      // Contact Name
  title: 3,        // Position/Title
  email: 4,        // Email
  linkedIn: 6,     // LinkedIn URL  
  status: 9,       // Status
  lastContacted: 10, // Last Contacted
  notes: 11,       // Notes
  companyInfoUrl: 12, // Company Info URL
  gumboScore: 13   // Gumbo Score
};

async function run() {
  try {
    console.log('🚀 PE Research & Enrichment Cron - Starting...\n');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet (all data, no headers)
    console.log('📖 Reading Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:O'
    });
    
    const rows = response.data.values || [];
    console.log(`\n📊 Sheet has ${rows.length} rows`);
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const company = row[COLUMNS.company] || '';
      const contact = row[COLUMNS.contact] || '';
      const email = row[COLUMNS.email] || '';
      const status = (row[COLUMNS.status] || '').toLowerCase();
      const website = row[COLUMNS.website] || '';
      
      if (!company) continue;
      if (status.includes('dead') || status.includes('closed')) continue;
      
      const hasGenericEmail = email && (
        email.toLowerCase().includes('info@') ||
        email.toLowerCase().includes('sales@') ||
        email.toLowerCase().includes('ir@') ||
        email.toLowerCase().includes('contact@') ||
        email.toLowerCase().includes('hello@')
      );
      
      const needsWork = !contact || !email || hasGenericEmail;
      
      if (needsWork) {
        needsEnrichment.push({
          rowNum: i + 1,
          rowIndex: i,
          company,
          contact: contact || '',
          title: row[COLUMNS.title] || '',
          email: email || '',
          website,
          status: row[COLUMNS.status] || '',
          linkedin: row[COLUMNS.linkedIn] || '',
          notes: row[COLUMNS.notes] || ''
        });
      }
    }
    
    console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment`);
    
    // Show first 15
    console.log(`\n🎯 Top candidates needing enrichment:\n`);
    needsEnrichment.slice(0, 15).forEach((lead, idx) => {
      console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
      console.log(`   Contact: "${lead.contact || '(EMPTY)'}" | Email: "${lead.email || '(EMPTY)'}"`);
      console.log(`   Website: ${lead.website || '(none)'}`);
      console.log(`   Status: ${lead.status}`);
      console.log('');
    });
    
    // Save the list for manual review
    const outputPath = path.join(__dirname, `enrichment-candidates-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(outputPath, JSON.stringify(needsEnrichment, null, 2));
    console.log(`\n📄 Saved enrichment candidates to: ${outputPath}`);
    
    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 SCAN SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total rows scanned: ${rows.length}`);
    console.log(`Leads needing enrichment: ${needsEnrichment.length}`);
    console.log(`  - Empty contact: ${needsEnrichment.filter(l => !l.contact).length}`);
    console.log(`  - Empty email: ${needsEnrichment.filter(l => !l.email).length}`);
    console.log(`  - Generic email: ${needsEnrichment.filter(l => l.email && (l.email.includes('info@') || l.email.includes('sales@') || l.email.includes('ir@'))).length}`);
    console.log(`${'='.repeat(60)}\n`);
    
    return needsEnrichment;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

run().then(leads => {
  console.log(`\n✅ Scan complete. Ready for enrichment.`);
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Scan failed:', err.message);
  process.exit(1);
});
