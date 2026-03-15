const fs = require('fs');
const path = require('path');

// Read the enrichment needs file
const needsFile = 'enrichment-needs-march9-906am.json';
const needs = JSON.parse(fs.readFileSync(needsFile, 'utf8'));

console.log('=== PE ENRICHMENT CRON - March 9, 9:36 AM ===\n');
console.log(`Total enrichment needs: ${needs.length}`);

// Categorize needs
const noContact = needs.filter(n => n.reason === 'No contact name');
const genericEmail = needs.filter(n => n.reason === 'Generic email');
const notEnriched = needs.filter(n => n.reason === 'Status not enriched');

console.log(`\nBreakdown:`);
console.log(`- No contact name: ${noContact.length}`);
console.log(`- Generic email: ${genericEmail.length}`);
console.log(`- Status not enriched: ${notEnriched.length}`);

// Filter out non-PE firms (educational, recruiting, etc.)
const realPEFirms = needs.filter(n => {
  const status = (n.status || '').toLowerCase();
  return !status.includes('not a pe') &&
         !status.includes('nonprofit') &&
         !status.includes('recruiting') &&
         !status.includes('educational') &&
         n.firm.trim().length > 0;
});

console.log(`\nReal PE firms needing enrichment: ${realPEFirms.length}`);

// Prioritize: firms with websites but no contacts
const highPriority = realPEFirms.filter(n => 
  n.website && n.website.trim().length > 0 && !n.contactName
).slice(0, 15);

console.log(`\nHigh priority targets (has website, no contact): ${highPriority.length}`);
console.log('\nTop 15 firms to enrich:\n');

highPriority.forEach((firm, i) => {
  console.log(`${i + 1}. ${firm.firm}`);
  console.log(`   Website: ${firm.website}`);
  console.log(`   Row: ${firm.rowIndex}`);
  console.log('');
});

// Save targets for next enrichment pass
fs.writeFileSync('enrich-targets-march9-936am.json', JSON.stringify(highPriority, null, 2));
console.log(`\nSaved ${highPriority.length} targets to enrich-targets-march9-936am.json`);
