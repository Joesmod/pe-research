const data = require('./_enrichment_targets.json');
console.log('Total:', data.length);

const needs = data.filter(t => 
  t.status !== 'Contacted' && 
  t.status !== 'Enriched' && 
  t.status !== 'Researched' &&
  !t.status?.startsWith('Dead')
);

console.log('Needs enrichment:', needs.length);
console.log('\nFirst 20 needing enrichment:');
needs.slice(0, 20).forEach((t, i) => {
  console.log(`${i+1}. ${t.company} (${t.status || 'New'}) [Row ${t.rowIndex}]`);
  console.log(`   Contact: ${t.contactName || 'EMPTY'}`);
  console.log(`   Email: ${t.email || 'EMPTY'}`);
  console.log('');
});
