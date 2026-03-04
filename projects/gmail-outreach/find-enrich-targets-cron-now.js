const fs = require('fs');

// Read sheet data
const sheetData = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));
const [header, ...rows] = sheetData;

// Indices
const COMPANY = 0;
const CONTACT_NAME = 1;
const TITLE = 2;
const EMAIL = 3;
const WEBSITE = 4;
const LINKEDIN = 5;
const SECTOR = 6;
const PORTFOLIO = 7;
const STATUS = 8;
const LAST_CONTACTED = 9;

// Find rows needing enrichment
const needsEnrichment = rows.filter(row => {
  const contactName = (row[CONTACT_NAME] || '').trim();
  const email = (row[EMAIL] || '').trim().toLowerCase();
  const status = (row[STATUS] || '').trim();
  
  // Skip if already contacted or in progress
  if (status === 'Contacted' || status === 'Draft' || status === 'Enriching') {
    return false;
  }
  
  // Need enrichment if:
  // 1. No contact name
  // 2. Generic email (info@, sales@, ir@, contact@, hello@)
  // 3. No email at all
  
  const hasNoContact = !contactName || contactName === '';
  const hasGenericEmail = email.startsWith('info@') || 
                          email.startsWith('sales@') || 
                          email.startsWith('ir@') ||
                          email.startsWith('contact@') ||
                          email.startsWith('hello@') ||
                          email.startsWith('invest@');
  const hasNoEmail = !email || email === '';
  
  return hasNoContact || hasGenericEmail || hasNoEmail;
});

console.log(`\n=== ENRICHMENT TARGETS ===`);
console.log(`Total firms in sheet: ${rows.length}`);
console.log(`Firms needing enrichment: ${needsEnrichment.length}\n`);

// Group by issue
const noContact = needsEnrichment.filter(r => !(r[CONTACT_NAME] || '').trim());
const genericEmail = needsEnrichment.filter(r => {
  const email = (r[EMAIL] || '').trim().toLowerCase();
  return email && (email.startsWith('info@') || email.startsWith('sales@') || 
                    email.startsWith('ir@') || email.startsWith('contact@') ||
                    email.startsWith('hello@') || email.startsWith('invest@'));
});
const noEmail = needsEnrichment.filter(r => !(r[EMAIL] || '').trim());

console.log(`Breakdown:`);
console.log(`- No contact name: ${noContact.length}`);
console.log(`- Generic email: ${genericEmail.length}`);
console.log(`- No email: ${noEmail.length}\n`);

// Show first 15 targets
console.log(`\nFirst 15 targets:\n`);
needsEnrichment.slice(0, 15).forEach((row, i) => {
  console.log(`${i + 1}. ${row[COMPANY]}`);
  console.log(`   Contact: ${row[CONTACT_NAME] || '(empty)'}`);
  console.log(`   Email: ${row[EMAIL] || '(empty)'}`);
  console.log(`   Website: ${row[WEBSITE]}`);
  console.log(`   Status: ${row[STATUS]}`);
  console.log('');
});

// Save targets to file
fs.writeFileSync('enrichment-targets-now.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-now.json`);
