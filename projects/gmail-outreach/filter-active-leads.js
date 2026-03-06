const fs = require('fs');

const leads = JSON.parse(fs.readFileSync('leads-to-enrich.json', 'utf8'));

// Filter for active leads (not Dead, not Contacted, not Enriched with good data)
const activeLeads = leads.filter(lead => {
  const status = lead.status || '';
  // Skip if Dead or already Contacted
  if (status.includes('Dead') || status.includes('Contacted') || status.includes('Sent')) {
    return false;
  }
  // Include if missing contact or has generic email
  return true;
});

console.log(`Active leads needing enrichment: ${activeLeads.length}\n`);

// Show first 15
activeLeads.slice(0, 15).forEach((lead, idx) => {
  console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
  console.log(`   Website: ${lead.website}`);
  console.log(`   Contact: ${lead.contactName || '(EMPTY)'}`);
  console.log(`   Email: ${lead.email || '(EMPTY)'}`);
  console.log(`   Status: ${lead.status || '(none)'}`);
  console.log('');
});

// Save active leads
fs.writeFileSync('active-leads-to-enrich.json', JSON.stringify(activeLeads.slice(0, 15), null, 2));
console.log(`Saved top 15 active leads to active-leads-to-enrich.json`);
