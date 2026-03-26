const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Column indices (0-based)
const COL = {
  FIRM: 0,           // A: Company Name
  NOTEBOOK: 1,       // B: NotebookLM
  CONTACT: 2,        // C: Contact Name
  TITLE: 3,          // D: Position/Title
  EMAIL: 4,          // E: Email
  WEBSITE_OR_MISC: 5,// F: (varies)
  LINKEDIN: 6,       // G: LinkedIn URL
  STATUS1: 7,        // H: Status
  NOTES1: 8,         // I: Notes
  STATUS2: 9,        // J: Status (seems to be the main one)
  LAST_CONTACTED: 10,// K: Last Contacted
  NOTES2: 11,        // L: Notes
  INFO_URL: 12,      // M: Company Info URL
  SCORE: 13          // N: Gumbo Score
};

async function main() {
  console.log('\n=== PE Research & Enrichment - Sunday March 15 ===\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all data
  console.log('Reading Google Sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1000',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    console.log('No data found.');
    return;
  }
  
  console.log(`Total rows: ${rows.length}\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) { // Skip header row
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const firm = row[COL.FIRM] || '';
    const contact = row[COL.CONTACT] || '';
    const email = row[COL.EMAIL] || '';
    const title = row[COL.TITLE] || '';
    const status = row[COL.STATUS2] || row[COL.STATUS1] || '';
    const linkedin = row[COL.LINKEDIN] || '';
    
    // Skip if Dead/Paused/Sent/Replied
    if (status && ['Dead', 'Paused', 'Sent', 'Replied'].some(s => status.includes(s))) {
      continue;
    }
    
    // Check if email is generic
    const genericEmailPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@'];
    const hasGenericEmail = email && genericEmailPrefixes.some(prefix => 
      email.toLowerCase().startsWith(prefix)
    );
    
    // Needs enrichment if:
    // - Empty contact name OR
    // - Empty/generic email
    const needsWork = !contact || !email || hasGenericEmail;
    
    if (needsWork && firm) { // Only include if we have a firm name
      needsEnrichment.push({
        rowIndex: i + 1,
        firm,
        contact,
        title,
        email,
        linkedin,
        status,
        reason: !contact ? 'No contact' : hasGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ All leads are enriched! No work needed.');
    return;
  }
  
  // Take top 15
  const batch = needsEnrichment.slice(0, 15);
  
  console.log('=== BATCH TO ENRICH (15 leads) ===\n');
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.firm} (Row ${lead.rowIndex})`);
    console.log(`   Current Contact: "${lead.contact}"`);
    console.log(`   Current Email: "${lead.email}"`);
    console.log(`   Current Title: "${lead.title}"`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });
  
  console.log('\n--- RESEARCH INSTRUCTIONS ---');
  console.log('For each firm, search for decision-makers with direct email:');
  console.log('');
  console.log('Target roles (cast a WIDE net):');
  console.log('  - C-Level: CEO, CTO, COO, CMO, CFO, CDO');
  console.log('  - Partners: Managing, Operating, General, Investment');
  console.log('  - Directors: Technology, Product, Operations, Marketing, BD, Digital');
  console.log('  - VPs: Technology, Operations, Digital Transformation, Portfolio Ops');
  console.log('  - Heads of: Value Creation, Portfolio Ops, Business Development');
  console.log('');
  console.log('Search methods:');
  console.log('  1. Firm website: /team /about /leadership /contact pages');
  console.log('  2. LinkedIn: site:linkedin.com "[firm name]" + title keywords');
  console.log('  3. Press releases, conference speaker bios');
  console.log('  4. SEC filings, PDFs, brochures');
  console.log('  5. Crunchbase, PitchBook profiles');
  console.log('');
  console.log('⚠️ STRICT RULES:');
  console.log('  - ONLY use emails from official published sources');
  console.log('  - NEVER guess email patterns');
  console.log('  - Note the source in the Notes column');
  console.log('  - Leave blank if no verified email found');
  console.log('  - Update Status to "Enriched" when complete');
  console.log('');
  
  // Save batch
  const outputPath = path.join(__dirname, 'enrichment-batch-march15-sunday.json');
  fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2));
  console.log(`\n✅ Batch saved to: ${outputPath}\n`);
  
  // Also create a summary report
  const reportPath = path.join(__dirname, 'ENRICHMENT-REPORT-MARCH15-SUNDAY.md');
  const report = `# PE Enrichment Report - Sunday March 15, 2026
  
## Summary
- Total rows in sheet: ${rows.length - 1}
- Leads needing enrichment: ${needsEnrichment.length}
- Batch size (this run): ${batch.length}

## Batch Details

${batch.map((lead, idx) => `### ${idx + 1}. ${lead.firm} (Row ${lead.rowIndex})
- **Current Contact:** ${lead.contact || '(empty)'}
- **Current Email:** ${lead.email || '(empty)'}
- **Current Title:** ${lead.title || '(empty)'}
- **Status:** ${lead.status || '(empty)'}
- **Reason:** ${lead.reason}
`).join('\n')}

## Next Steps
1. Research each firm above
2. Find decision-makers with verified emails
3. Update the Google Sheet with findings
4. Git commit results to pe-research repo
`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`📋 Report saved to: ${reportPath}\n`);
}

main().catch(console.error);
