const fs = require('fs');

// Read the sheet data (strip BOM if present)
let rawData = fs.readFileSync('current-sheet-data-march6-506am.json', 'utf8');
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}
const data = JSON.parse(rawData);

// Parse into objects
const headers = data[0];
const rows = data.slice(1).map((row, idx) => {
  const obj = {};
  headers.forEach((header, i) => {
    obj[header] = row[i] || '';
  });
  obj._row = idx + 2; // Excel row (1-indexed + header)
  return obj;
});

// Find rows needing enrichment
const needsEnrichment = rows.filter(row => {
  const companyName = row['Company Name'] || '';
  const contactName = row['Contact Name'] || '';
  const email = row['Email'] || '';
  const status = row['Status'] || '';
  
  // Skip if no company name
  if (!companyName.trim()) return false;
  
  // Skip if status contains "Dead" or is "Sent"
  if (status === 'Sent' || status.includes('Dead')) return false;
  
  // Needs enrichment if:
  // 1. No contact name
  // 2. No email at all
  // 3. Generic email (info@, sales@, ir@, contact@, admin@)
  const genericPatterns = /^(info|sales|ir|contact|admin|support|hello|general)@/i;
  
  const hasNoContact = !contactName.trim();
  const hasNoEmail = !email.trim();
  const hasGenericEmail = email && genericPatterns.test(email);
  
  return hasNoContact || hasNoEmail || hasGenericEmail;
});

console.log(`Total rows: ${rows.length}`);
console.log(`Need enrichment: ${needsEnrichment.length}`);
console.log('\nTop 15 firms needing enrichment:\n');

needsEnrichment.slice(0, 15).forEach(row => {
  console.log(`Row ${row._row}: ${row['Company Name']}`);
  console.log(`  Contact: ${row['Contact Name'] || '(empty)'}`);
  console.log(`  Email: ${row['Email'] || '(empty)'}`);
  console.log(`  Website: ${row['Website'] || '(empty)'}`);
  console.log(`  Status: ${row['Status']}`);
  console.log('');
});

// Save full list to file
fs.writeFileSync(
  'enrichment-needs-march6-506am.json',
  JSON.stringify(needsEnrichment, null, 2)
);

console.log(`\nFull list saved to: enrichment-needs-march6-506am.json`);
