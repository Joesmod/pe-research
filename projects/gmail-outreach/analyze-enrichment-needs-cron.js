const fs = require('fs');

// Read the current PE data
const data = JSON.parse(fs.readFileSync('current-pe-data.json', 'utf8'));

// Filter for leads needing enrichment
const needsEnrichment = data.filter(row => {
  const noContact = !row['Contact Name'] || row['Contact Name'].trim() === '';
  const genericEmail = !row.Email || 
                      row.Email.trim() === '' ||
                      row.Email.match(/^(info@|sales@|ir@|contact@|hello@)/i);
  const notDead = row.Status && 
                  !row.Status.match(/Dead|Do Not Contact/i) &&
                  row.Status !== '';
  const isActiveFirm = row.Status && 
                       (row.Status.match(/New|Partial|Enriched|Active/i) ||
                        row.Status.trim() === '');
  
  return (noContact || genericEmail) && notDead && isActiveFirm;
});

console.log(`\n=== ENRICHMENT NEEDS ANALYSIS ===`);
console.log(`Total leads needing enrichment: ${needsEnrichment.length}`);
console.log(`\n=== TOP 15 PRIORITY TARGETS ===\n`);

needsEnrichment.slice(0, 15).forEach((row, idx) => {
  console.log(`${idx + 1}. ${row['Company Name']}`);
  console.log(`   Contact: ${row['Contact Name'] || '(empty)'}`);
  console.log(`   Email: ${row.Email || '(empty)'}`);
  console.log(`   Website: ${row.Website || '(none)'}`);
  console.log(`   Status: ${row.Status}`);
  console.log(`   Row: ${row._row}`);
  console.log('');
});

// Save the list to a file for reference
fs.writeFileSync(
  'enrichment-targets-cron-' + new Date().toISOString().slice(0, 10) + '.json',
  JSON.stringify(needsEnrichment.slice(0, 15), null, 2)
);

console.log(`\n✅ Target list saved for enrichment run.`);
