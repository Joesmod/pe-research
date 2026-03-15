// PE Research & Enrichment - Cleaned targets
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

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

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:N',
  });

  const rows = response.data.values || [];
  console.log(`Total rows: ${rows.length}`);

  const needsEnrichment = [];
  const seen = new Set(); // Track unique companies
  
  rows.forEach((row, idx) => {
    const company = (row[COL.COMPANY] || '').trim();
    const contact = (row[COL.CONTACT] || '').trim();
    const email = (row[COL.EMAIL] || '').trim();
    const status = (row[COL.STATUS] || '').trim();
    const website = (row[COL.WEBSITE] || '').trim();

    // Skip empty companies
    if (!company) return;
    
    // Skip Dead firms, already Contacted/Replied
    if (status.includes('Dead') || status === 'Contacted' || status === 'Replied') return;

    // Skip duplicates (same company + contact)
    const key = `${company}:${contact}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    // Check if needs enrichment
    const noContact = !contact;
    const noEmail = !email;
    const hasGenericEmail = email && /^(info@|contact@|sales@|ir@|investor@|hello@|admin@|press@|media@)/i.test(email);

    if (noContact || noEmail || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: idx + 2,
        company,
        website,
        contact,
        email,
        status,
        reason: noContact ? 'No contact name' : (noEmail ? 'No email' : 'Generic email')
      });
    }
  });

  console.log(`\n🔍 Found ${needsEnrichment.length} unique leads needing enrichment`);
  
  const targetLeads = needsEnrichment.slice(0, 15);
  
  console.log(`\n📋 Top ${targetLeads.length} targets for enrichment:\n`);
  
  targetLeads.forEach((lead, i) => {
    console.log(`${i+1}. ${lead.company} (Row ${lead.rowIndex})`);
    console.log(`   Website: ${lead.website || '(missing)'}`);
    console.log(`   Contact: ${lead.contact || '(missing)'}`);
    console.log(`   Email: ${lead.email || '(missing)'}`);
    console.log(`   Issue: ${lead.reason}`);
    console.log(`   Status: ${lead.status || '(none)'}`);
    console.log('');
  });

  fs.writeFileSync(
    path.join(__dirname, 'enrichment-clean-targets-march13.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), targets: targetLeads }, null, 2)
  );

  console.log(`\n✅ Saved to enrichment-clean-targets-march13.json`);
  console.log(`\n🎯 Action: Begin manual research on these ${targetLeads.length} firms\n`);

  return targetLeads;
}

enrichPELeads().catch(console.error);
