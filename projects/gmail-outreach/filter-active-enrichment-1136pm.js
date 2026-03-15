const fs = require('fs');

const targets = JSON.parse(fs.readFileSync('enrich-targets-march6-1136pm.json', 'utf8'));

// Filter out Dead leads
const activeTargets = targets.filter(t => !t.status.startsWith('Dead'));

console.log(`Total targets: ${targets.length}`);
console.log(`Active targets (not Dead): ${activeTargets.length}`);
console.log('\nTop 15 active targets needing enrichment:\n');

activeTargets.slice(0, 15).forEach((t, i) => {
  console.log(`${i + 1}. Row ${t.row}: ${t.company}`);
  console.log(`   Status: ${t.status}`);
  console.log(`   Contact: ${t.contact || 'MISSING'}`);
  console.log(`   Email: ${t.email || 'MISSING'}`);
  console.log(`   Reason: ${t.reason}\n`);
});

// Save filtered list
fs.writeFileSync(
  'active-enrichment-targets-1136pm.json',
  JSON.stringify(activeTargets.slice(0, 15), null, 2)
);

console.log(`Saved top 15 active targets to active-enrichment-targets-1136pm.json`);
