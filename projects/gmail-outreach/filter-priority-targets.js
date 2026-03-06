const fs = require('fs');
const targets = JSON.parse(fs.readFileSync('enrich-targets-now.json', 'utf8'));

// Filter to high-priority targets: has name but needs email
const hasNameNeedsEmail = targets.filter(t => 
  t.status !== 'DUPLICATE' &&
  t.status !== 'Waiting on email intro' &&
  t.contactName !== '(empty)' &&
  t.email === '(empty)'
).slice(0, 10);

// Also get some that need both name and email
const needsBoth = targets.filter(t => 
  t.status !== 'DUPLICATE' &&
  t.status !== 'Waiting on email intro' &&
  t.contactName === '(empty)' &&
  t.email === '(empty)' &&
  t.website
).slice(0, 5);

const priority = [...hasNameNeedsEmail, ...needsBoth];

console.log(`Priority targets for enrichment: ${priority.length}`);
console.log(JSON.stringify(priority, null, 2));

fs.writeFileSync('priority-enrich-targets.json', JSON.stringify(priority, null, 2));
console.log(`\nWrote ${priority.length} priority targets to priority-enrich-targets.json`);
