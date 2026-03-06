const fs = require('fs');
const leads = JSON.parse(fs.readFileSync('leads-to-enrich-1206pm.json', 'utf8'));

// Skip first 15, show next 20
const nextBatch = leads.slice(15, 35);

console.log('=== NEXT 20 FIRMS TO RESEARCH ===\n');
nextBatch.forEach((lead, idx) => {
  console.log(`${idx + 16}. ${lead.firm}`);
  console.log(`   Row: ${lead.row} | Contact: "${lead.contactName}" | Email: "${lead.email}"`);
  console.log('');
});

fs.writeFileSync('batch-2-leads.json', JSON.stringify(nextBatch, null, 2));
console.log(`\nSaved ${nextBatch.length} leads to batch-2-leads.json`);
