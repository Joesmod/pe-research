const fs = require('fs');

const qualified = JSON.parse(fs.readFileSync('qualified-contacts.json', 'utf8'));

const today = new Date('2026-03-25');
const cutoffDate = new Date(today);
cutoffDate.setDate(cutoffDate.getDate() - 7);

console.log(`Today: ${today.toISOString().split('T')[0]}`);
console.log(`Cutoff (7 days ago): ${cutoffDate.toISOString().split('T')[0]}\n`);

// Filter: skip companies contacted in last 7 days
const eligible = [];
const companiesSeen = new Set();
const recentlyContacted = [];

for (const contact of qualified) {
  // Check if company already selected (only 1 per company)
  if (companiesSeen.has(contact.company)) continue;
  
  // Check last contacted date
  if (contact.lastContacted && contact.lastContacted !== 'Never') {
    const contactDate = new Date(contact.lastContacted);
    if (contactDate > cutoffDate) {
      recentlyContacted.push({ ...contact, contactDate });
      continue;
    }
  }
  
  // Assign tech role priority
  const techRole = /CTO|CITO|Chief.*Tech|Chief.*AI|Chief.*Data|Chief.*Digital|Chief.*Information|Head.*Tech|Head.*AI|Head.*Data|VP.*Tech|VP.*Product|VP.*Data|Director.*Tech|Portfolio.*Ops|Value Creation|Innovation|Digital.*Transform/i.test(contact.title);
  
  eligible.push({
    ...contact,
    techRole
  });
  
  companiesSeen.add(contact.company);
}

console.log(`Filtered ${recentlyContacted.length} contacts from companies recently contacted:`);
recentlyContacted.forEach(c => {
  console.log(`  - ${c.company} (${c.name}): ${c.contactDate.toISOString().split('T')[0]}`);
});

// Sort: tech roles first, then by score, then alphabetically
eligible.sort((a, b) => {
  if (a.techRole !== b.techRole) return a.techRole ? -1 : 1;
  if (b.score !== a.score) return b.score - a.score;
  return a.company.localeCompare(b.company);
});

const top25 = eligible.slice(0, 25);

console.log(`\n=== TOP 25 CONTACTS FOR OUTREACH ===\n`);
top25.forEach((c, i) => {
  const marker = c.techRole ? '🎯' : '  ';
  console.log(`${i+1}. ${marker} [${c.score}] ${c.company}`);
  console.log(`   ${c.name} - ${c.title}`);
  console.log(`   ${c.email}\n`);
});

fs.writeFileSync('top25-final.json', JSON.stringify(top25, null, 2));
console.log(`✓ Saved ${top25.length} contacts to top25-final.json`);
