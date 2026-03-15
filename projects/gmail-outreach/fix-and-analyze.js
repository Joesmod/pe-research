const fs = require('fs');

// Try reading with BOM handling
let rawData = fs.readFileSync('sheet-clean-temp.json', 'utf8');

// Remove BOM if present
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}

const data = JSON.parse(rawData);

// Skip header row
const rows = data.slice(1);

// Find leads needing enrichment
const needsEnrichment = rows.filter(row => {
  const company = row[0] || '';
  const contactName = row[2] || '';
  const email = row[4] || '';
  const status = row[9] || '';
  
  // Skip if status contains "Dead", "Bounced", "Sent", or "Replied"
  if (status && (
    status.includes('Dead') || 
    status.includes('Bounced') || 
    status.includes('Sent') ||
    status.includes('Replied')
  )) {
    return false;
  }
  
  // Need enrichment if:
  // 1. No contact name, OR
  // 2. Email is empty or generic (info@, sales@, ir@, contact@, hello@, admin@)
  const hasContact = contactName && contactName.trim().length > 0;
  const hasDirectEmail = email && 
    !email.startsWith('info@') && 
    !email.startsWith('sales@') && 
    !email.startsWith('ir@') &&
    !email.startsWith('contact@') &&
    !email.startsWith('hello@') &&
    !email.startsWith('admin@');
  
  return !hasContact || !hasDirectEmail;
});

console.log(`Total rows: ${rows.length}`);
console.log(`Needs enrichment: ${needsEnrichment.length}`);
console.log('\n--- Sample leads needing enrichment ---\n');

needsEnrichment.slice(0, 20).forEach((row, idx) => {
  console.log(`${idx + 1}. ${row[0] || 'Unknown'}`);
  console.log(`   Contact: ${row[2] || 'MISSING'}`);
  console.log(`   Email: ${row[4] || 'MISSING'}`);
  console.log(`   Status: ${row[9] || 'None'}`);
  console.log(`   Website: ${row[5] || ''}`);
  console.log('');
});

// Save full list
fs.writeFileSync('leads-needing-enrichment-cron.json', JSON.stringify(needsEnrichment, null, 2), 'utf8');
console.log(`\nFull list saved to leads-needing-enrichment-cron.json`);
