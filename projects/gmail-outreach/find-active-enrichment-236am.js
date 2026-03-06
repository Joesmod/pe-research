const fs = require('fs');

const data = JSON.parse(fs.readFileSync('current-pe-data.json', 'utf8'));

const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];

// Filter for active PE firms that need enrichment
const needsEnrichment = data.filter(row => {
  // Skip Dead leads
  if (row['Status'] && row['Status'].toLowerCase().includes('dead')) {
    return false;
  }
  
  // Skip leads marked as "Not PE"
  if (row['Notes'] && (
    row['Notes'].toLowerCase().includes('not pe') ||
    row['Notes'].toLowerCase().includes('not a pe') ||
    row['Notes'].toLowerCase().includes('executive search') ||
    row['Notes'].toLowerCase().includes('investment bank') ||
    row['Notes'].toLowerCase().includes('hedge fund')
  )) {
    return false;
  }
  
  const hasNoContact = !row['Contact Name'] || row['Contact Name'].trim() === '' || row['Contact Name'] === 'Jacob Zodikoff';
  const hasNoEmail = !row['Email'] || row['Email'].trim() === '';
  const hasGenericEmail = row['Email'] && genericPrefixes.some(prefix => row['Email'].toLowerCase().startsWith(prefix));
  
  return hasNoContact || hasNoEmail || hasGenericEmail;
}).slice(0, 15);  // Top 15 real targets

console.log(`Found ${needsEnrichment.length} active PE firms needing enrichment:`);
console.log(JSON.stringify(needsEnrichment, null, 2));
