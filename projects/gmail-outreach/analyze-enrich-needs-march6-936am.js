const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('sheet-data-march6-936am.json', 'utf8'));

const needsEnrichment = rawData.filter((row, idx) => {
  if (idx === 0) return false; // skip header
  
  const [company, website, contactName, title, email, , , , , status] = row;
  
  // Skip if already enriched
  if (status === 'Enriched') return false;
  
  // Skip "Dead" leads
  if (status && status.startsWith('Dead')) return false;
  
  // Need enrichment if:
  // 1. No contact name
  // 2. Generic email (info@, sales@, ir@, contact@, admin@)
  const hasGenericEmail = email && (
    email.startsWith('info@') ||
    email.startsWith('sales@') ||
    email.startsWith('ir@') ||
    email.startsWith('contact@') ||
    email.startsWith('admin@') ||
    email.includes('general@')
  );
  
  const noContactName = !contactName || contactName.trim() === '';
  
  return noContactName || hasGenericEmail;
});

console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);

// Take first 15
const targets = needsEnrichment.slice(0, 15).map((row, idx) => {
  const [company, website, contactName, title, email, , , , notes, status] = row;
  return {
    idx: idx + 1,
    company,
    website,
    contactName: contactName || '(EMPTY)',
    title: title || '(EMPTY)',
    email: email || '(EMPTY)',
    status: status || 'New',
    notes: notes || ''
  };
});

console.log('TOP 15 TARGETS FOR ENRICHMENT:\n');
targets.forEach(t => {
  console.log(`${t.idx}. ${t.company}`);
  console.log(`   Website: ${t.website}`);
  console.log(`   Contact: ${t.contactName}`);
  console.log(`   Email: ${t.email}`);
  console.log(`   Status: ${t.status}`);
  console.log('');
});

fs.writeFileSync('enrichment-targets-march6-936am.json', JSON.stringify(targets, null, 2));
console.log('\nSaved to enrichment-targets-march6-936am.json');
