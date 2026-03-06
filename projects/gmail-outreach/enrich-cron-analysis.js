const fs = require('fs');

// Read the sheet data - handle UTF-16LE encoding
let raw = fs.readFileSync('sheet-data-raw.json', 'utf16le');
// Clean up any remaining issues
raw = raw.replace(/^\uFEFF/, '');
const data = JSON.parse(raw);

console.log(`Total rows: ${data.length}`);

const needsEnrichment = [];
const headers = data[0];

// Find indices
const companyIdx = 0;
const contactIdx = 1;
const titleIdx = 2;
const emailIdx = 3;
const statusIdx = 8;

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const company = row[companyIdx] || '';
  const contact = row[contactIdx] || '';
  const title = row[titleIdx] || '';
  const email = row[emailIdx] || '';
  const status = row[statusIdx] || '';
  
  // Skip if already marked as dead or contacted
  if (status.toLowerCase().includes('dead') || 
      status.toLowerCase().includes('contacted')) {
    continue;
  }
  
  // Check if needs enrichment
  const needsContact = !contact || contact.trim() === '';
  const hasGenericEmail = email && (
    email.includes('info@') || 
    email.includes('sales@') || 
    email.includes('ir@') ||
    email.includes('contact@') ||
    email.includes('admin@')
  );
  const noEmail = !email || email.trim() === '';
  
  if (needsContact || hasGenericEmail || noEmail) {
    needsEnrichment.push({
      row: i + 1, // 1-indexed for Google Sheets
      company,
      contact,
      title,
      email,
      status,
      reason: needsContact ? 'No contact name' : 
              hasGenericEmail ? 'Generic email' : 
              'No email'
    });
  }
}

console.log(`\nLeads needing enrichment: ${needsEnrichment.length}`);
console.log('\nTop 15:');
needsEnrichment.slice(0, 15).forEach(lead => {
  console.log(`\nRow ${lead.row}: ${lead.company}`);
  console.log(`  Contact: ${lead.contact || '(empty)'}`);
  console.log(`  Email: ${lead.email || '(empty)'}`);
  console.log(`  Status: ${lead.status}`);
  console.log(`  Reason: ${lead.reason}`);
});

// Write to file for reference
fs.writeFileSync('leads-to-enrich.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`\nFull list saved to leads-to-enrich.json`);
