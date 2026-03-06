// Analyze enrichment needs for March 6, 5:36 AM cron run
const fs = require('fs');

// Load current data
const data = JSON.parse(fs.readFileSync('current-pe-data.json', 'utf8'));

console.log(`Total leads in sheet: ${data.length}\n`);

// Find leads needing enrichment
const needsEnrichment = data.filter(lead => {
  const contact = (lead['Contact Name'] || '').trim();
  const email = (lead['Email'] || '').trim().toLowerCase();
  const status = (lead['Status'] || '').trim();
  
  // Skip if already sent, dead, invalid, or bounced
  if (status.includes('Dead') || ['Invalid', 'Bounced', 'Sent'].includes(status)) {
    return false;
  }
  
  // Needs enrichment if:
  // - No contact name
  // - No email
  // - Generic email (info@, sales@, ir@, contact@)
  const noContact = !contact || contact === '';
  const noEmail = !email || email === '';
  const genericEmail = email.startsWith('info@') || 
                       email.startsWith('sales@') || 
                       email.startsWith('ir@') ||
                       email.startsWith('contact@');
  
  return noContact || noEmail || genericEmail;
});

console.log(`Leads needing enrichment: ${needsEnrichment.length}\n`);

// Show first 15 for this run
console.log('Top 15 targets for enrichment:\n');
needsEnrichment.slice(0, 15).forEach((lead, i) => {
  console.log(`${i + 1}. Row ${lead._row}: ${lead['Company Name']}`);
  console.log(`   Contact: ${lead['Contact Name'] || '(empty)'}`);
  console.log(`   Email: ${lead['Email'] || '(empty)'}`);
  console.log(`   Status: ${lead['Status'] || '(empty)'}`);
  console.log(`   Website: ${lead['Website'] || '(empty)'}`);
  console.log('');
});

// Save targets for processing
const targets = needsEnrichment.slice(0, 15).map(lead => ({
  row: lead._row,
  company: lead['Company Name'],
  website: lead['Website'],
  contact: lead['Contact Name'] || '',
  email: lead['Email'] || '',
  status: lead['Status'] || '',
  linkedin: lead['LinkedIn'] || ''
}));

fs.writeFileSync('enrichment-targets-march6-536am.json', JSON.stringify(targets, null, 2));
console.log(`\nSaved ${targets.length} targets to enrichment-targets-march6-536am.json`);
