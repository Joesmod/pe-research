const data = require('./sheet-data.json');

// Skip header row
const rows = data.slice(1);

const needsEnrichment = [];

rows.forEach((row, idx) => {
  const firmName = row[0];
  const contactName = row[2];
  const email = row[4];
  const status = row[9];
  
  if (!firmName || firmName.trim() === '') return; // Skip empty rows
  
  const hasGenericEmail = email && (
    email.includes('info@') || 
    email.includes('sales@') || 
    email.includes('ir@') ||
    email.includes('contact@') ||
    email === 'email_not_unlocked@domain.com'
  );
  
  const needsWork = !contactName || !email || hasGenericEmail || 
                    (status && status.toLowerCase().includes('needs'));
  
  if (needsWork) {
    needsEnrichment.push({
      rowIndex: idx + 2, // +2 for header + 0-based
      firmName,
      contactName: contactName || '(missing)',
      email: email || '(missing)',
      status: status || ''
    });
  }
});

console.log(`\n=== LEADS NEEDING ENRICHMENT: ${needsEnrichment.length} ===\n`);

// Show first 15
needsEnrichment.slice(0, 15).forEach(lead => {
  console.log(`Row ${lead.rowIndex}: ${lead.firmName}`);
  console.log(`  Contact: ${lead.contactName}`);
  console.log(`  Email: ${lead.email}`);
  console.log(`  Status: ${lead.status}`);
  console.log();
});

if (needsEnrichment.length > 15) {
  console.log(`... and ${needsEnrichment.length - 15} more\n`);
}
