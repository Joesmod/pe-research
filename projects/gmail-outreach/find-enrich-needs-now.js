const fs = require('fs');

// Read and strip BOM if present
let jsonData = fs.readFileSync('sheet-data.json', 'utf8');
if (jsonData.charCodeAt(0) === 0xFEFF) {
  jsonData = jsonData.slice(1);
}
const data = JSON.parse(jsonData);

// Skip header row
const leads = data.slice(1);

const needsEnrichment = [];

for (let i = 0; i < leads.length; i++) {
  const [company, contactName, title, email, website, linkedin, sector, portfolio, status] = leads[i];
  
  // Skip if already has a good contact
  if (contactName && email && !email.match(/^(info|sales|ir|contact|admin|general|support)@/i)) {
    continue;
  }
  
  // Skip if status is Dead/Replied/Meeting
  if (status && (status.includes('Dead') || status.includes('Replied') || status.includes('Meeting'))) {
    continue;
  }
  
  needsEnrichment.push({
    row: i + 2, // +2 because header is row 1 and array is 0-indexed
    company,
    contactName: contactName || '(empty)',
    email: email || '(empty)',
    website,
    linkedin,
    sector,
    status: status || 'New'
  });
}

console.log(`Found ${needsEnrichment.length} leads needing enrichment:`);
console.log(JSON.stringify(needsEnrichment.slice(0, 20), null, 2));

fs.writeFileSync('enrich-targets-now.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`\nWrote ${needsEnrichment.length} targets to enrich-targets-now.json`);
