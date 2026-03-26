const fs = require('fs');

// Read the sheet data
const sheetData = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));
const header = sheetData[0];
const rows = sheetData.slice(1);

// Find firms that need enrichment
const needsEnrichment = rows.filter((row, idx) => {
  const company = row[0] || '';
  const contactName = row[1] || '';
  const email = row[3] || '';
  const status = row[8] || '';
  
  // Skip if already contacted or enriched
  if (status === 'Contacted' || status === 'Enriched') return false;
  
  // Need enrichment if:
  // 1. No contact name, OR
  // 2. Generic email (info@, sales@, ir@, contact@), OR
  // 3. Empty email
  const genericEmail = email.match(/^(info|sales|ir|contact|hello|support|admin)@/i);
  const missingContact = !contactName || contactName.trim() === '';
  const missingEmail = !email || email.trim() === '';
  
  return missingContact || genericEmail || missingEmail;
}).slice(0, 15); // Take first 15

console.log(`\n📊 Found ${needsEnrichment.length} firms needing enrichment\n`);

needsEnrichment.forEach((row, idx) => {
  console.log(`${idx + 1}. ${row[0]}`);
  console.log(`   Contact: ${row[1] || '(empty)'}`);
  console.log(`   Email: ${row[3] || '(empty)'}`);
  console.log(`   Status: ${row[8] || '(empty)'}`);
  console.log('');
});

// Output targets for manual research
fs.writeFileSync('_enrich_targets_0336.json', JSON.stringify(needsEnrichment, null, 2));
console.log('✅ Targets written to _enrich_targets_0336.json');
