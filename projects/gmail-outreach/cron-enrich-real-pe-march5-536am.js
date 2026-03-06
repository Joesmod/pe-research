const fs = require('fs');

// Read the sheet data
const sheetData = JSON.parse(fs.readFileSync('./sheet-data-march5-5am.json', 'utf8'));

console.log('=== PE Enrichment Analysis - REAL PE FIRMS - March 5, 5:36 AM ===\n');

// Skip header row
const rows = sheetData.slice(1);

// Find REAL PE firms needing enrichment
const needsEnrichment = rows.filter((row, idx) => {
  const company = row[0] || '';
  const contactName = row[2] || '';
  const email = row[4] || '';
  const status = row[9] || '';
  
  // Skip if status contains "Dead" or is Contacted/Sent/Replied
  if (status.includes('Dead') || ['Contacted', 'Sent', 'Replied'].includes(status)) {
    return false;
  }
  
  // Must have company name
  if (!company || company.trim().length === 0) {
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
console.log(`Real PE firms needing enrichment: ${needsEnrichment.length}\n`);

// Show first 15 for enrichment
console.log('=== TOP 15 REAL PE FIRMS NEEDING ENRICHMENT ===\n');
needsEnrichment.slice(0, 15).forEach((row, idx) => {
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

// Save full list for Apollo enrichment
const enrichmentTargets = needsEnrichment.slice(0, 15).map(row => ({
  company: row[0],
  website: row[1] || row[5],
  contactName: row[2],
  title: row[3],
  email: row[4],
  linkedin: row[6],
  status: row[9],
  rowData: row // Keep full row for updating later
}));

fs.writeFileSync(
  './enrichment-targets-real-pe-march5-536am.json',
  JSON.stringify(enrichmentTargets, null, 2)
);

console.log('\n=== Saved top 15 real PE firms to enrichment-targets-real-pe-march5-536am.json ===');
console.log('\n=== Ready for Apollo enrichment ===');
