const data = require('./_enrichment_targets.json');
const unresearched = data.filter(t => t.status === 'New - Unresearched');

console.log('Next 20 firms needing research:');
unresearched.slice(20, 40).forEach((t, i) => {
  console.log(`${i+21}. ${t.company} (${t.website || 'no website'}) [Row ${t.rowIndex}]`);
});
