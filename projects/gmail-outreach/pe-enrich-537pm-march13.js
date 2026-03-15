// PE Research & Enrichment - Friday March 13, 2026 @ 5:37 PM
// Target: Enrich 10-15 leads with empty Contact Name or generic emails
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

// Standard PE Sheet columns (based on inspection)
const COL = {
  COMPANY: 0,      // A
  WEBSITE: 1,      // B
  CONTACT: 2,      // C
  TITLE: 3,        // D
  EMAIL: 4,        // E
  PHONE: 5,        // F
  LINKEDIN: 6,     // G
  CATEGORY: 7,     // H
  SOURCE: 8,       // I
  STATUS: 9,       // J
  LAST_CONTACTED: 10, // K
  NOTES: 11,       // L
  INFO_URL: 12,    // M
  GUMBO_SCORE: 13  // N
};

async function enrichPELeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`\n=== PE Research & Enrichment - ${new Date().toLocaleString()} ===`);
  console.log(`Sheet ID: ${SHEET_ID}\n`);

  // Read all data from Sheet1
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:N', // Skip header row (row 1)
  });

  const rows = response.data.values || [];
  console.log(`Total rows in sheet: ${rows.length}`);

  // Find leads needing enrichment
  const needsEnrichment = [];
  
  rows.forEach((row, idx) => {
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim();
    const website = (row[COL.WEBSITE] || '').trim();
    const notes = (row[COL.NOTES] || '').trim();

    // Skip if no company or status is Dead/Contacted/Replied
    if (!company) return;
    if (status === 'Dead' || status === 'Contacted' || status === 'Replied') return;

    // Check if needs enrichment
    const noContact = !contact;
    const noEmail = !email;
    const hasGenericEmail = email && /^(info@|contact@|sales@|ir@|investor@|hello@|admin@|press@|media@)/i.test(email);

    if (noContact || noEmail || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: idx + 2, // +2 for header and 0-index
        company,
        website,
        contact,
        email,
        status,
        notes,
        reason: noContact ? 'No contact name' : (noEmail ? 'No email' : 'Generic email')
      });
    }
  });

  console.log(`\n🔍 Found ${needsEnrichment.length} leads needing enrichment`);
  
  // Take first 15
  const targetLeads = needsEnrichment.slice(0, 15);
  
  console.log(`\n📋 Targeting ${targetLeads.length} for this enrichment run:\n`);
  
  targetLeads.forEach((lead, i) => {
    console.log(`${i+1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Current Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Current Email: ${lead.email || '(empty)'}`);
    console.log(`   Status: ${lead.status || '(empty)'}`);
    console.log(`   Issue: ${lead.reason}`);
    console.log('');
  });

  // Save to file for reference
  const output = {
    timestamp: new Date().toISOString(),
    totalRows: rows.length,
    needsEnrichment: needsEnrichment.length,
    targetedForEnrichment: targetLeads.length,
    leads: targetLeads
  };

  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march13-537pm.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`\n✅ Enrichment targets saved to enrichment-targets-march13-537pm.json`);
  console.log(`\n📝 Next steps:`);
  console.log(`1. For each firm, search for decision-makers:`);
  console.log(`   - C-suite: CEO, COO, CTO, CMO, CFO`);
  console.log(`   - Partners: Managing, Operating, General`);
  console.log(`   - Directors: Technology, Product, Operations, Digital, BD`);
  console.log(`   - VPs: Technology, Operations, Portfolio Ops`);
  console.log(`   - Heads of: Value Creation, Portfolio Ops, BD`);
  console.log(`2. Search methods:`);
  console.log(`   - Firm website team/contact pages`);
  console.log(`   - site:linkedin.com "[firm name]" partner`);
  console.log(`   - Press releases, conference bios`);
  console.log(`   - SEC filings, fund documents`);
  console.log(`3. ONLY use published, verified emails`);
  console.log(`4. Update sheet with: Contact Name, Title, Email, LinkedIn URL`);
  console.log(`5. Note source in Notes column`);
  console.log(`6. Update Status to "Enriched" when complete\n`);

  return { targetLeads, totalNeedsEnrichment: needsEnrichment.length };
}

enrichPELeads().catch(console.error);
