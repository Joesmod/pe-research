const fs = require('fs');

const needs = JSON.parse(fs.readFileSync('./enrichment-needs-1136pm.json', 'utf8'));

console.log('=== ANALYZING EMAIL DATA ===\n');

// Check how many have emails in the linkedin column
const hasEmailInLinkedIn = needs.filter(n => {
  const linkedin = n.linkedin || '';
  return linkedin.includes('@');
});

console.log(`Total needing enrichment: ${needs.length}`);
console.log(`Have email in LinkedIn column: ${hasEmailInLinkedIn.length}`);
console.log(`Truly need new research: ${needs.length - hasEmailInLinkedIn.length}\n`);

// Show samples of each type
console.log('=== HAVE EMAIL IN LINKEDIN COLUMN (just need to move) ===');
hasEmailInLinkedIn.slice(0, 5).forEach((n, idx) => {
  console.log(`${idx + 1}. Row ${n.row}: ${n.company}`);
  console.log(`   Contact: ${n.contactName}`);
  console.log(`   Email in LinkedIn col: ${n.linkedin}`);
});

console.log('\n=== TRULY NEED RESEARCH (no email anywhere) ===');
const trulyNeed = needs.filter(n => !(n.linkedin || '').includes('@'));
trulyNeed.slice(0, 10).forEach((n, idx) => {
  console.log(`${idx + 1}. Row ${n.row}: ${n.company}`);
  console.log(`   Contact: ${n.contactName || 'MISSING'}`);
  console.log(`   Position: ${n.position || 'N/A'}`);
  console.log(`   LinkedIn: ${n.linkedin || 'N/A'}`);
});

// Save the truly needing research
fs.writeFileSync('./truly-need-research-1136pm.json', JSON.stringify(trulyNeed, null, 2));
console.log(`\n✅ Saved ${trulyNeed.length} firms truly needing research to truly-need-research-1136pm.json`);
