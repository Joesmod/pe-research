const fs = require('fs');

console.log('🔍 Finding leads that need improvement or are new...\n');

const data = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));
const rows = data;

const needsImprovement = [];
const newLeads = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const firm = row[0] || '';
  const domain = row[1] || '';
  const contact = row[2] || '';
  const title = row[3] || '';
  const email = row[4] || '';
  const status = row[9] || '';
  
  // Skip Dead/Sent/Skipped
  if (status && (
    status.toLowerCase().includes('dead') || 
    status.toLowerCase() === 'sent' || 
    status.toLowerCase() === 'skipped'
  )) {
    continue;
  }
  
  // Check for New/empty status
  if (!status || status.trim() === '' || status.toLowerCase() === 'new') {
    newLeads.push({ row: i+1, firm, domain, contact, email, status });
    continue;
  }
  
  // Check for Partial or generic emails in Enriched status
  if (status.toLowerCase().includes('partial') || status.toLowerCase().includes('enriched')) {
    const hasGenericEmail = email && (
      email.toLowerCase().includes('info@') || 
      email.toLowerCase().includes('sales@') || 
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('admin@')
    );
    const hasNoEmail = !email || email.trim() === '';
    const hasNoContact = !contact || contact.trim() === '';
    
    if (hasGenericEmail || hasNoEmail || hasNoContact) {
      needsImprovement.push({
        row: i+1, firm, domain, contact, email, status,
        issue: hasGenericEmail ? 'Generic email' : (hasNoEmail ? 'No email' : 'No contact')
      });
    }
  }
}

console.log(`📊 Status summary:`);
console.log(`   New/unresearched: ${newLeads.length}`);
console.log(`   Needs improvement (Partial/Enriched with issues): ${needsImprovement.length}\n`);

console.log(`🆕 New firms (first 10):\n`);
newLeads.slice(0, 10).forEach(l => {
  console.log(`   ${l.firm}`);
  console.log(`      Domain: ${l.domain || '(none)'}`);
  console.log(`      Contact: ${l.contact || '(none)'}`);
  console.log(`      Email: ${l.email || '(none)'}\n`);
});

console.log(`\n🔧 Needs improvement (first 10):\n`);
needsImprovement.slice(0, 10).forEach(l => {
  console.log(`   ${l.firm} - ${l.issue}`);
  console.log(`      Domain: ${l.domain || '(none)'}`);
  console.log(`      Contact: ${l.contact || '(none)'}`);
  console.log(`      Email: ${l.email}\n`);
});

// Save
const combined = [...needsImprovement, ...newLeads];
fs.writeFileSync('enrichment-queue.json', JSON.stringify(combined.slice(0, 15), null, 2));
console.log(`\n✅ Saved top 15 enrichment targets to enrichment-queue.json\n`);
