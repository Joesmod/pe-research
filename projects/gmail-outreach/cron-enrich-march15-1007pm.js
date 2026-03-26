const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('🔍 PE Research & Enrichment - Sunday Night Run\n');
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:P',
  });
  
  const rows = response.data.values || [];
  if (rows.length < 2) {
    console.log('❌ Sheet is empty or malformed');
    return;
  }
  
  const headers = rows[0];
  console.log('📊 Headers:', headers.join(' | '));
  
  // Find column indices
  const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact'));
  const emailIdx = headers.findIndex(h => h && h.toLowerCase().includes('email'));
  const statusIdx = headers.findIndex(h => h && h.toLowerCase().includes('status'));
  
  console.log(`\n📍 Column indices: Company=${companyIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip if status is "Dead", "Sent", "Replied", "Enriched"
    if (['Dead', 'Sent', 'Replied', 'Enriched'].some(s => status.includes(s))) {
      continue;
    }
    
    // Check if needs enrichment:
    // 1. Empty contact name
    // 2. Empty or generic email (info@, sales@, ir@, contact@, admin@, hello@)
    const hasEmptyContact = !contact || contact.trim() === '';
    const hasGenericEmail = !email || 
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('admin@') ||
      email.includes('hello@') ||
      email.trim() === '';
    
    if (hasEmptyContact || hasGenericEmail) {
      needsEnrichment.push({
        rowNumber: i + 1,
        company,
        contact: contact || '(empty)',
        email: email || '(empty)',
        status,
        reason: hasEmptyContact ? 'Empty contact' : 'Generic/empty email'
      });
    }
  }
  
  console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Show first 15 (or all if fewer)
  const toShow = needsEnrichment.slice(0, 15);
  console.log('📋 Top candidates for enrichment:\n');
  toShow.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNumber}: ${lead.company}`);
    console.log(`   Contact: ${lead.contact}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Status: ${lead.status}`);
    console.log('');
  });
  
  if (needsEnrichment.length > 15) {
    console.log(`... and ${needsEnrichment.length - 15} more\n`);
  }
  
  console.log('\n🎯 Next steps:');
  console.log('For each firm, I will:');
  console.log('1. Search firm website (team/about/contact pages)');
  console.log('2. Check LinkedIn (site:linkedin.com queries)');
  console.log('3. Look for press releases, conference bios');
  console.log('4. Search for any decision-maker with direct email');
  console.log('5. Update sheet with: Name, Title, Email, LinkedIn, Source\n');
  
  // Save to file for reference
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'enrichment-targets-march15-1007pm.json'),
    JSON.stringify(needsEnrichment, null, 2)
  );
  
  console.log('💾 Saved enrichment targets to enrichment-targets-march15-1007pm.json\n');
}

main().catch(console.error);
