const fs = require('fs');

const data = JSON.parse(fs.readFileSync('current-pe-data.json', 'utf8'));

const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];

const needsEnrichment = data.filter(row => {
  const hasNoContact = !row['Contact Name'] || row['Contact Name'].trim() === '';
  const hasNoEmail = !row['Email'] || row['Email'].trim() === '';
  const hasGenericEmail = row['Email'] && genericPrefixes.some(prefix => row['Email'].toLowerCase().startsWith(prefix));
  
  return hasNoContact || hasNoEmail || hasGenericEmail;
}).slice(0, 20);  // Get top 20 to review

console.log(`Total rows needing enrichment: ${needsEnrichment.length}`);
console.log(JSON.stringify(needsEnrichment, null, 2));
