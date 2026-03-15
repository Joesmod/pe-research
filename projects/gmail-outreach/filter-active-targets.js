const fs = require('fs');

const needs = JSON.parse(fs.readFileSync('needs-enrichment.json', 'utf8'));

// Filter out Dead status - focus on active targets
const activeTargets = needs.filter(item => {
  const status = (item.status || '').toLowerCase();
  return !status.includes('dead') && !status.includes('duplicate');
});

console.log(`Total needing enrichment: ${needs.length}`);
console.log(`Active (not dead/duplicate): ${activeTargets.length}\n`);
console.log('Top 15 active targets for enrichment:');
activeTargets.slice(0, 15).forEach((item, idx) => {
  console.log(`${idx + 1}. Row ${item.rowNum}: ${item.company}`);
  console.log(`   Contact: ${item.contact || '(empty)'}`);
  console.log(`   Email: ${item.email || '(empty)'}`);
  console.log(`   Status: ${item.status}`);
  console.log(`   Reason: ${item.reason}\n`);
});

fs.writeFileSync('active-targets.json', JSON.stringify(activeTargets, null, 2));
console.log(`Saved ${activeTargets.length} active targets to active-targets.json`);
