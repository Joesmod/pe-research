const fs = require('fs');

// Read the current PE data
const data = JSON.parse(fs.readFileSync('current-pe-data.json', 'utf8'));

// Find firms needing enrichment
const needsEnrichment = data.filter(row => {
  const name = (row['Contact Name'] || '').trim();
  const email = (row.Email || '').trim();
  
  // Empty contact name OR generic/empty email
  const emptyName = !name || name === '';
  const genericEmail = email && (
    email.startsWith('info@') || 
    email.startsWith('sales@') || 
    email.startsWith('ir@') ||
    email.startsWith('contact@') ||
    email.startsWith('hello@') ||
    email.startsWith('admin@') ||
    email.startsWith('support@')
  );
  const emptyEmail = !email || email === '';
  
  return emptyName || genericEmail || emptyEmail;
});

console.log(`Found ${needsEnrichment.length} firms needing enrichment`);
console.log('\nFirst 15 firms to enrich:\n');

needsEnrichment.slice(0, 15).forEach((firm, idx) => {
  console.log(`${idx + 1}. ${firm['Company Name']}`);
  console.log(`   Website: ${firm.Website || 'N/A'}`);
  console.log(`   Current Contact: ${firm['Contact Name'] || '[EMPTY]'}`);
  console.log(`   Current Email: ${firm.Email || '[EMPTY]'}`);
  console.log(`   Status: ${firm.Status || 'N/A'}`);
  console.log('');
});

// Save the enrichment targets
fs.writeFileSync('enrich-targets-536pm.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
console.log('\nSaved enrichment targets to enrich-targets-536pm.json');
