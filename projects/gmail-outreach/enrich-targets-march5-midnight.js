// PE Research & Enrichment - March 5 00:06 AM
// Identify enrichment targets from sheet data

const fs = require('fs');

// Read current sheet data
const rawData = fs.readFileSync('current-sheet-data.json', 'utf8');
const rows = JSON.parse(rawData);

console.log(`Total rows in sheet: ${rows.length}`);

// Filter for enrichment targets
const needsEnrichment = rows.filter((row, idx) => {
  if (idx === 0) return false; // Skip header
  
  const [company, website, contactName, title, email, , , , , status] = row;
  
  // Target criteria:
  // 1. Empty contact name OR
  // 2. Empty/generic email (info@, sales@, ir@) OR
  // 3. Status contains "New", "Researched", "Partial", "Needs"
  
  const hasNoContact = !contactName || contactName.trim() === '';
  const hasNoEmail = !email || email.trim() === '';
  const hasGenericEmail = email && (
    email.toLowerCase().startsWith('info@') ||
    email.toLowerCase().startsWith('sales@') ||
    email.toLowerCase().startsWith('ir@')
  );
  const needsWork = status && (
    status.includes('New') ||
    status.includes('Researched') ||
    status.includes('Partial') ||
    status.includes('Needs')
  );
  
  // Skip dead leads
  const isDead = status && status.toLowerCase().includes('dead');
  
  return !isDead && (hasNoContact || hasNoEmail || hasGenericEmail || needsWork);
});

console.log(`\nLeads needing enrichment: ${needsEnrichment.length}\n`);

// Take top 15
const targets = needsEnrichment.slice(0, 15);

console.log('TOP 15 ENRICHMENT TARGETS:\n');
targets.forEach((row, idx) => {
  const [company, website, contactName, title, email, , , , , status] = row;
  console.log(`${idx + 1}. ${company || 'Unknown'}`);
  console.log(`   Website: ${website || 'N/A'}`);
  console.log(`   Current: ${contactName || '(empty)'} | ${email || '(empty)'}`);
  console.log(`   Status: ${status || 'N/A'}`);
  console.log('');
});

// Save to file
fs.writeFileSync('enrich-targets-march5-midnight.json', JSON.stringify(targets, null, 2));
console.log('Targets saved to enrich-targets-march5-midnight.json');
