const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function main() {
  console.log('🫡 Reading current sheet data...');
  const sheets = await getClient();
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  
  const rows = res.data.values || [];
  if (rows.length < 2) {
    console.log('Sheet is empty or has no data rows.');
    return;
  }
  
  const header = rows[0];
  const companyIdx = header.indexOf('Company Name');
  const contactIdx = header.indexOf('Contact Name');
  const emailIdx = header.indexOf('Email');
  const statusIdx = header.indexOf('Status');
  const titleIdx = header.indexOf('Title');
  const linkedinIdx = header.indexOf('LinkedIn');
  const notesIdx = header.indexOf('Notes');
  
  console.log(`\nColumn indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
  
  // Identify leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if status contains terminal states
    const skipStatuses = ['Contacted', 'Dead', 'Bounced', 'No Fit', 'Replied', 'Sent'];
    if (skipStatuses.some(s => status.toLowerCase().includes(s.toLowerCase()))) {
      continue;
    }
    
    // Skip if company name is empty
    if (!company.trim()) {
      continue;
    }
    
    // Check if needs enrichment:
    // - No contact name, OR
    // - No email, OR
    // - Generic email (info@, sales@, ir@, investor@, contact@)
    const hasContact = contact.trim().length > 0;
    const hasEmail = email.trim().length > 0;
    const isGenericEmail = /^(info|sales|ir|investor|contact|general|support|hello|admin)@/i.test(email);
    
    if (!hasContact || !hasEmail || isGenericEmail) {
      needsEnrichment.push({
        row: i + 1, // Excel row number (1-indexed)
        company,
        contact,
        email,
        status,
        reason: !hasContact ? 'No contact' : isGenericEmail ? 'Generic email' : 'No email'
      });
    }
  }
  
  console.log(`\n📊 Analysis complete:`);
  console.log(`Total rows: ${rows.length - 1}`);
  console.log(`Needs enrichment: ${needsEnrichment.length}`);
  
  if (needsEnrichment.length === 0) {
    console.log('\n✅ No leads need enrichment!');
    return;
  }
  
  // Take first 15 for this run
  const targets = needsEnrichment.slice(0, 15);
  
  console.log(`\n🎯 Targeting ${targets.length} leads for enrichment:`);
  targets.forEach(t => {
    console.log(`Row ${t.row}: ${t.company} | ${t.reason} | Status: ${t.status}`);
  });
  
  // Save to file for processing
  fs.writeFileSync(
    path.join(__dirname, 'enrich-targets-march7-106am.json'),
    JSON.stringify(targets, null, 2)
  );
  
  console.log(`\n✅ Targets saved to enrich-targets-march7-106am.json`);
  console.log(`\n🔍 Now starting manual web research for these ${targets.length} firms...`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
