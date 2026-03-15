const fs = require('fs');
const path = require('path');

// Read the enrichment needs file
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'enrichment-needs-march10-1036pm.json'), 'utf8')
);

console.log(`Total leads with issues: ${data.length}\n`);

// Categorize by issue type
const categories = {
  noEmail: [],
  genericEmail: [],
  emptyContact: [],
  mismatchedDomain: []
};

data.forEach(lead => {
  if (lead.issues.includes('No Email')) {
    categories.noEmail.push(lead);
  }
  if (lead.issues.includes('Generic Email')) {
    categories.genericEmail.push(lead);
  }
  if (lead.issues.includes('Empty Contact Name')) {
    categories.emptyContact.push(lead);
  }
  if (lead.issues.includes('Mismatched Domain')) {
    categories.mismatchedDomain.push(lead);
  }
});

console.log('=== ENRICHMENT PRIORITIES ===\n');
console.log(`❌ No Email: ${categories.noEmail.length} leads`);
console.log(`📧 Generic Email: ${categories.genericEmail.length} leads`);
console.log(`👤 Empty Contact: ${categories.emptyContact.length} leads`);
console.log(`🔀 Mismatched Domain: ${categories.mismatchedDomain.length} leads`);
console.log('');

// Priority 1: No email or generic email
const priority1 = [
  ...categories.noEmail,
  ...categories.genericEmail
].filter((item, index, self) => 
  index === self.findIndex(t => t.row === item.row)
);

console.log(`\n=== PRIORITY 1: Leads needing verified emails (${priority1.length}) ===\n`);
priority1.slice(0, 10).forEach((lead, idx) => {
  console.log(`${idx + 1}. ${lead.company} (Row ${lead.row})`);
  console.log(`   Contact: ${lead.contact || '(empty)'}`);
  console.log(`   Current Email: ${lead.email || '(empty)'}`);
  console.log(`   Issue: ${lead.issues}`);
  console.log('');
});

// Priority 2: Empty contact name
console.log(`\n=== PRIORITY 2: Leads needing contact names (${categories.emptyContact.length}) ===\n`);
categories.emptyContact.slice(0, 10).forEach((lead, idx) => {
  console.log(`${idx + 1}. ${lead.company} (Row ${lead.row})`);
  console.log(`   Current Email: ${lead.email || '(empty)'}`);
  console.log('');
});

// Summary
console.log('\n=== RECOMMENDATION ===');
console.log(`Start with Priority 1 leads: ${priority1.length} firms need direct contact emails`);
console.log('Then move to Priority 2: Firms with emails but missing contact names');
console.log('\nMismatched domain issues are lower priority (might be correct cross-company contacts)');

// Save priority lists
fs.writeFileSync(
  path.join(__dirname, 'priority-enrichment-targets-march10.json'),
  JSON.stringify({
    priority1,
    priority2: categories.emptyContact,
    summary: {
      totalIssues: data.length,
      noEmail: categories.noEmail.length,
      genericEmail: categories.genericEmail.length,
      emptyContact: categories.emptyContact.length,
      mismatchedDomain: categories.mismatchedDomain.length
    }
  }, null, 2)
);

console.log('\nPriority targets saved to: priority-enrichment-targets-march10.json');
