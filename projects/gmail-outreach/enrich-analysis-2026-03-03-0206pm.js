// Enrich Analysis - 2026-03-03 02:06 PM
// Identify leads needing enrichment

const fs = require('fs');

const sheetData = JSON.parse(fs.readFileSync('sheet-current.json', 'utf8'));

// Skip header row
const rows = sheetData.slice(1);

const needsEnrichment = rows.filter(row => {
  const [company, contactName, title, email, website, linkedin, sectors, description, status, source, notes] = row;
  
  // Skip dead leads and already enriched
  if (status === 'Dead Lead' || status === 'Enriched') return false;
  
  // Check if needs enrichment
  const noContact = !contactName || contactName.trim() === '';
  const genericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@');
  
  return noContact || genericEmail;
});

console.log(`Total leads needing enrichment: ${needsEnrichment.length}`);

// Prioritize by status
const priorityOrder = {
  'New - Unresearched': 1,
  'Researched': 2,
  'Researched - Needs Verification': 3,
  'Researched - No Email': 4,
  'Needs Enrichment': 5
};

const sorted = needsEnrichment.sort((a, b) => {
  const statusA = priorityOrder[a[8]] || 999;
  const statusB = priorityOrder[b[8]] || 999;
  return statusA - statusB;
});

// Top 15 targets
const targets = sorted.slice(0, 15);

console.log('\n=== TOP 15 ENRICHMENT TARGETS ===\n');
targets.forEach((row, idx) => {
  const [company, contactName, title, email, website, linkedin, sectors] = row;
  console.log(`${idx + 1}. ${company}`);
  console.log(`   Contact: ${contactName || '(none)'}`);
  console.log(`   Email: ${email || '(none)'}`);
  console.log(`   Website: ${website}`);
  console.log(`   Sectors: ${sectors || '(none)'}`);
  console.log('');
});

// Write to file
fs.writeFileSync(
  'enrichment-targets-2026-03-03-0206pm.json',
  JSON.stringify(targets, null, 2)
);

console.log('Targets saved to enrichment-targets-2026-03-03-0206pm.json');
