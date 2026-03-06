const fs = require('fs');

// Read the sheet data
const sheetData = JSON.parse(fs.readFileSync('./sheet-data-march5-5am.json', 'utf8'));

console.log('=== PE Enrichment Analysis - March 5, 5:36 AM ===\n');

// Skip header row
const rows = sheetData.slice(1);

// Find leads needing enrichment
const needsEnrichment = rows.filter((row, idx) => {
  const company = row[0] || '';
  const contactName = row[2] || '';
  const email = row[4] || '';
  const status = row[9] || '';
  
  // Skip if status is Contacted, Sent, or Replied
  if (['Contacted', 'Sent', 'Replied'].includes(status)) {
    return false;
  }
  
  // Needs enrichment if:
  // 1. No contact name, OR
  // 2. No email, OR
  // 3. Generic email (info@, sales@, ir@, contact@, hello@)
  const hasGenericEmail = email.match(/^(info|sales|ir|contact|hello|support)@/i);
  const needsContact = !contactName || contactName.trim().length === 0;
  const needsEmail = !email || email.trim().length === 0 || hasGenericEmail;
  
  return needsContact || needsEmail;
});

console.log(`Total rows: ${rows.length}`);
console.log(`Needs enrichment: ${needsEnrichment.length}\n`);

// Show first 20 for manual analysis
console.log('=== TOP 20 FIRMS NEEDING ENRICHMENT ===\n');
needsEnrichment.slice(0, 20).forEach((row, idx) => {
  const company = row[0] || 'N/A';
  const website = row[1] || row[5] || 'N/A';
  const contactName = row[2] || 'EMPTY';
  const email = row[4] || 'EMPTY';
  const status = row[9] || 'N/A';
  
  console.log(`${idx + 1}. ${company}`);
  console.log(`   Website: ${website}`);
  console.log(`   Contact: ${contactName}`);
  console.log(`   Email: ${email}`);
  console.log(`   Status: ${status}`);
  console.log('');
});

// Save full list for processing
fs.writeFileSync(
  './enrichment-targets-march5-536am.json',
  JSON.stringify(needsEnrichment.slice(0, 15).map(row => ({
    company: row[0],
    website: row[1] || row[5],
    contactName: row[2],
    title: row[3],
    email: row[4],
    linkedin: row[6],
    status: row[9]
  })), null, 2)
);

console.log('\n=== Saved top 15 to enrichment-targets-march5-536am.json ===');
