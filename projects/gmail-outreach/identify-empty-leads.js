const fs = require('fs');

// Read the sheet data
const data = fs.readFileSync('sheet-current.json', 'utf16le');
const lines = data.split('\n');

const needsEnrichment = [];

for (let i = 1; i < lines.length; i++) { // Skip header
  const line = lines[i];
  if (!line || line.trim().length === 0) continue;
  
  const cols = line.split('|').map(c => c.trim());
  
  if (cols.length < 7) continue;
  
  const companyName = cols[0];
  const contactName = cols[2];
  const title = cols[3];
  const email = cols[4];
  const status = cols[9];
  
  // Check if needs enrichment
  const emptyContact = !contactName || contactName === '';
  const genericEmail = email && (email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('media@'));
  const emptyEmail = !email || email === '';
  
  if ((emptyContact || genericEmail || emptyEmail) && status !== 'Dead Lead' && status !== 'DUPLICATE') {
    needsEnrichment.push({
      company: companyName,
      contactName: contactName || '(empty)',
      title: title || '(empty)',
      email: email || '(empty)',
      status: status,
      needsReason: emptyContact ? 'Empty Contact' : (genericEmail ? 'Generic Email' : 'Empty Email')
    });
  }
}

console.log(`\n=== LEADS NEEDING ENRICHMENT: ${needsEnrichment.length} ===\n`);
needsEnrichment.slice(0, 20).forEach((lead, idx) => {
  console.log(`${idx + 1}. ${lead.company}`);
  console.log(`   Contact: ${lead.contactName} | Title: ${lead.title}`);
  console.log(`   Email: ${lead.email}`);
  console.log(`   Status: ${lead.status} | Reason: ${lead.needsReason}`);
  console.log('');
});

fs.writeFileSync('leads-need-enrichment-march7.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`\nFull list saved to leads-need-enrichment-march7.json`);
