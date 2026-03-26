const fs = require('fs');

const data = JSON.parse(fs.readFileSync('_sheet1_dump.json', 'utf-8'));
const headers = data[0];
const rows = data.slice(1);

console.log('Finding firms needing enrichment...\n');

const needsEnrichment = [];

rows.forEach((row, idx) => {
  const company = row[0] || '';
  const contactName = row[1] || '';
  const title = row[2] || '';
  const email = row[3] || '';
  const website = row[4] || '';
  const status = row[8] || '';
  
  // Skip if already contacted
  if (status === 'Contacted') return;
  
  // Check if needs enrichment
  const emptyContact = !contactName || contactName.trim() === '';
  const genericEmail = email && (
    email.startsWith('info@') || 
    email.startsWith('sales@') || 
    email.startsWith('ir@') ||
    email.startsWith('contact@') ||
    email.startsWith('investor@')
  );
  
  if (emptyContact || genericEmail) {
    needsEnrichment.push({
      rowIndex: idx + 2, // +2 because: 1 for header, 1 for 1-based indexing
      company,
      contactName,
      title,
      email,
      website,
      status,
      reason: emptyContact ? 'Empty contact' : 'Generic email'
    });
  }
});

console.log(`Found ${needsEnrichment.length} firms needing enrichment:\n`);

needsEnrichment.slice(0, 20).forEach(firm => {
  console.log(`Row ${firm.rowIndex}: ${firm.company}`);
  console.log(`  Current contact: ${firm.contactName || '(empty)'}`);
  console.log(`  Current email: ${firm.email || '(empty)'}`);
  console.log(`  Website: ${firm.website}`);
  console.log(`  Reason: ${firm.reason}`);
  console.log('');
});

fs.writeFileSync('_enrichment_targets.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`✅ Saved ${needsEnrichment.length} targets to _enrichment_targets.json`);
