const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Column indices (0-based)
const COL = {
  FIRM: 0,           // A: Company Name
  WEBSITE: 1,        // B: Website
  CONTACT: 2,        // C: Contact Name
  TITLE: 3,          // D: Position/Title
  EMAIL: 4,          // E: Email
  ALT_INFO: 5,       // F: Alt info
  LINKEDIN: 6,       // G: LinkedIn URL
  ENRICH_STATUS: 7,  // H: Enrichment marker
  ENRICH_NOTES: 8,   // I: Enrichment notes
  STATUS: 9,         // J: Status (Dead/Paused/Sent/etc)
  LAST_CONTACT: 10,  // K: Last Contacted
  NOTES: 11,         // L: Notes
  INFO_URL: 12,      // M: Company Info URL
  SCORE: 13          // N: Gumbo Score
};

async function main() {
  console.log('\n=== PE Research & Enrichment - Hourly Run (11:07 PM) ===\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read entire sheet
  console.log('Reading Google Sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values || [];
  console.log(`Found ${rows.length} total rows\n`);
  
  if (rows.length === 0) {
    console.log('Sheet is empty.');
    return;
  }
  
  // Identify leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const firm = row[COL.FIRM] || '';
    const contact = row[COL.CONTACT] || '';
    const email = row[COL.EMAIL] || '';
    const status = row[COL.STATUS] || '';
    const enrichStatus = row[COL.ENRICH_STATUS] || '';
    
    // Skip if no firm name
    if (!firm.trim()) continue;
    
    // Skip if Dead/Paused/Sent/Replied
    if (['Dead', 'Paused', 'Sent', 'Replied'].includes(status)) continue;
    
    // Check if needs enrichment:
    // 1. Empty contact name OR
    // 2. Empty email OR generic email (info@, sales@, ir@, contact@)
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') ||
      email.toLowerCase().startsWith('sales@') ||
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@')
    );
    
    const needsContact = !contact.trim();
    const needsEmail = !email.trim() || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed for Google Sheets (A1 notation)
        arrayIndex: i,   // 0-indexed for array access
        firm: firm.trim(),
        contact: contact.trim(),
        email: email.trim(),
        status,
        enrichStatus,
        needsContact,
        needsEmail,
        genericEmail: hasGenericEmail,
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  if (needsEnrichment.length === 0) {
    console.log('✅ No leads need enrichment at this time.');
    return;
  }
  
  // Take top 10-15 that most urgently need enrichment
  const batch = needsEnrichment.slice(0, 15);
  
  console.log('=== ENRICHMENT BATCH (15 leads) ===\n');
  batch.forEach((lead, idx) => {
    const issues = [];
    if (lead.needsContact) issues.push('NO CONTACT');
    if (lead.needsEmail) issues.push(lead.genericEmail ? 'GENERIC EMAIL' : 'NO EMAIL');
    
    console.log(`${idx + 1}. ${lead.firm} (Row ${lead.rowIndex})`);
    console.log(`   Issues: ${issues.join(', ')}`);
    console.log(`   Current Contact: "${lead.contact}"`);
    console.log(`   Current Email: "${lead.email}"`);
    console.log('');
  });
  
  console.log('\n--- RESEARCH INSTRUCTIONS ---\n');
  console.log('For each firm, search for decision-makers using:');
  console.log('');
  console.log('1. **Firm website** → /team, /about, /leadership, /contact pages');
  console.log('2. **LinkedIn site search** → site:linkedin.com "[firm name]" CEO');
  console.log('3. **Press releases** → "[firm name]" announcement partner CEO');
  console.log('4. **Conference bios** → "[firm name]" speaker panel');
  console.log('5. **SEC filings / PDFs** → downloadable docs with contact lists');
  console.log('');
  console.log('**Target titles:**');
  console.log('  - C-Suite: CEO, CTO, COO, CFO, CMO, CIO');
  console.log('  - Partners: Managing Partner, General Partner, Operating Partner');
  console.log('  - Directors: Technology, Product, Operations, Marketing, Digital, BD');
  console.log('  - VPs: Technology, Operations, Digital Transformation, Portfolio Ops');
  console.log('  - Heads: Value Creation, Portfolio Operations, Business Development');
  console.log('');
  console.log('**Email rules:**');
  console.log('  ✅ ONLY use emails found on official published sources');
  console.log('  ❌ NEVER guess email patterns');
  console.log('  ❌ NEVER hallucinate contacts');
  console.log('  📝 Note the source in enrichment notes');
  console.log('  🔍 If not found, leave blank - don\'t force it');
  console.log('');
  console.log('Once enriched, update Status column to "Enriched" and add source notes.\n');
  
  // Save batch to file
  const fs = require('fs');
  const timestamp = Date.now();
  const filename = `enrichment-batch-march15-${timestamp}.json`;
  fs.writeFileSync(
    path.join(__dirname, filename),
    JSON.stringify(batch, null, 2)
  );
  
  console.log(`✅ Batch saved to ${filename}\n`);
}

main().catch(console.error);
