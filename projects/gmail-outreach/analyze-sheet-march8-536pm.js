const fs = require('fs');

console.log('🔍 Analyzing sheet data from 11:37 AM...\n');

const data = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));
const rows = data;

if (!rows || rows.length === 0) {
  console.log('❌ No data found.');
  process.exit(1);
}

const headers = rows[0];
console.log('📋 Headers:', headers.join(' | '));
console.log(`📊 Total rows: ${rows.length - 1}\n`);

// Find leads needing enrichment
const needsEnrichment = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const firm = row[0] || '';
  const domain = row[1] || '';
  const contact = row[2] || '';
  const email = row[3] || '';
  const title = row[4] || '';
  const linkedin = row[5] || '';
  const status = row[9] || '';
  const notes = row[10] || '';
  
  // Skip if already sent or dead
  if (status === 'Sent' || status === 'Dead' || status === 'Skipped') continue;
  
  // Check if needs enrichment
  const hasNoContact = !contact || contact.trim() === '';
  const hasGenericEmail = email && (
    email.toLowerCase().includes('info@') || 
    email.toLowerCase().includes('sales@') || 
    email.toLowerCase().includes('ir@') ||
    email.toLowerCase().includes('contact@') ||
    email.toLowerCase().includes('admin@') ||
    email.toLowerCase().includes('hello@') ||
    email.toLowerCase().includes('support@')
  );
  const hasNoEmail = !email || email.trim() === '';
  
  if (hasNoContact || hasGenericEmail || hasNoEmail) {
    needsEnrichment.push({
      row: i + 1,
      firm,
      domain,
      contact,
      email,
      title,
      linkedin,
      status,
      notes,
      issue: hasNoContact ? 'No contact' : (hasNoEmail ? 'No email' : 'Generic email')
    });
  }
}

console.log(`🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);

// Prioritize: real PE firms with domains
const withDomains = needsEnrichment.filter(l => l.domain && l.domain.trim());
console.log(`   ${withDomains.length} have domains (prioritize these)\n`);

// Show top 15 with domains first
const toEnrich = withDomains.slice(0, 15);

console.log('🎯 Top 15 enrichment targets (with domains):\n');
toEnrich.forEach((lead, idx) => {
  console.log(`${idx + 1}. ${lead.firm}`);
  console.log(`   Domain: ${lead.domain}`);
  console.log(`   Issue: ${lead.issue}`);
  console.log(`   Current Contact: ${lead.contact || '(empty)'}`);
  console.log(`   Current Email: ${lead.email || '(empty)'}`);
  console.log(`   Status: ${lead.status || 'New'}`);
  if (lead.notes) console.log(`   Notes: ${lead.notes}`);
  console.log('');
});

// Save targets for manual research
fs.writeFileSync('enrichment-targets-march8-536pm.json', JSON.stringify(toEnrich, null, 2));
console.log(`✅ Enrichment targets saved to enrichment-targets-march8-536pm.json`);
console.log(`\n📝 Next: Manual web research to find decision-makers for these ${toEnrich.length} firms.\n`);
