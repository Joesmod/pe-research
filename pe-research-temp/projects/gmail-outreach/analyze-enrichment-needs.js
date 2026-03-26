const fs = require('fs');

// Read the sheet data - remove BOM if present
const buffer = fs.readFileSync('sheet-current.json');
let rawData = buffer.toString('utf8');

// Remove BOM if present (UTF-8 BOM is EF BB BF)
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}

const data = JSON.parse(rawData);

// Skip header row
const firms = data.slice(1);

// Filter firms needing enrichment
const needsEnrichment = firms.filter(row => {
  const contactName = row[1];
  const email = row[3];
  
  // Needs enrichment if:
  // 1. No contact name
  // 2. No email
  // 3. Generic email (info@, sales@, ir@, contact@)
  return !contactName || 
         !email || 
         email.match(/^(info|sales|ir|contact)@/i);
});

console.log(`Total firms in sheet: ${firms.length}`);
console.log(`Firms needing enrichment: ${needsEnrichment.length}`);
console.log(`\nFirst 20 firms needing enrichment:\n`);

needsEnrichment.slice(0, 20).forEach((row, i) => {
  const firmName = row[0];
  const contactName = row[1] || 'EMPTY';
  const email = row[3] || 'EMPTY';
  const status = row[8] || 'Unknown';
  
  console.log(`${i+1}. ${firmName}`);
  console.log(`   Contact: ${contactName}`);
  console.log(`   Email: ${email}`);
  console.log(`   Status: ${status}`);
  console.log('');
});
