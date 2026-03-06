const fs = require('fs');

// Read the sheet output from the previous command
const sheetData = JSON.parse(fs.readFileSync('current-pe-data.json', 'utf8'));

// Skip header row
const rows = sheetData.slice(1);

// Find rows that need enrichment
const needsEnrichment = [];

rows.forEach((row, index) => {
  const [company, website, contactName, title, email, website2, linkedin, sectors, description, status] = row;
  
  // Skip if already dead/not a PE firm
  if (status && status.toLowerCase().includes('dead')) return;
  
  // Check if needs enrichment
  const hasNoContact = !contactName || contactName.trim() === '' || contactName === 'Jacob Zodikoff';
  const hasGenericEmail = !email || 
                          email.includes('info@') || 
                          email.includes('sales@') || 
                          email.includes('ir@') ||
                          email.includes('contact@') ||
                          email.trim() === '';
  
  if (hasNoContact || hasGenericEmail) {
    needsEnrichment.push({
      rowIndex: index + 2, // +2 because we skip header and index is 0-based
      company,
      website,
      contactName: contactName || '[EMPTY]',
      email: email || '[EMPTY]',
      status,
      reason: hasNoContact ? 'No contact name' : 'Generic email'
    });
  }
});

console.log(`\nFound ${needsEnrichment.length} leads needing enrichment:\n`);

// Show first 20
needsEnrichment.slice(0, 20).forEach(lead => {
  console.log(`Row ${lead.rowIndex}: ${lead.company}`);
  console.log(`  Website: ${lead.website}`);
  console.log(`  Contact: ${lead.contactName}`);
  console.log(`  Email: ${lead.email}`);
  console.log(`  Status: ${lead.status || 'N/A'}`);
  console.log(`  Reason: ${lead.reason}`);
  console.log('');
});

// Save to file
fs.writeFileSync('enrichment-targets-march5-136pm.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march5-136pm.json`);
