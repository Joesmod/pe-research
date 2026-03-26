const fs = require('fs');
const data = JSON.parse(fs.readFileSync('crm-data.json', 'utf8'));

console.log('=== Contacts Sheet Structure ===\n');
console.log('Total rows:', data.contacts.length);

console.log('\n=== First 5 rows ===');
for (let i = 0; i < Math.min(5, data.contacts.length); i++) {
  const row = data.contacts[i];
  console.log(`\nRow ${i} (${row.length} columns):`);
  console.log('  [0] Company:', row[0]);
  console.log('  [1] Score:', row[1]);
  console.log('  [2] Name:', row[2]);
  console.log('  [3] Title:', row[3]);
  console.log('  [4] Email:', row[4]);
  console.log('  [5] Verification:', row[5]);
  console.log('  [8] Last Contacted:', row[8]);
}

// Find high-score verified contacts
console.log('\n=== High-score (>=8) verified contacts ===');
let found = [];
for (let i = 1; i < data.contacts.length; i++) {
  const row = data.contacts[i];
  const score = parseInt(row[1]);
  const email = row[4];
  const status = (row[5] || '').toLowerCase();
  const lastContacted = row[8];
  
  if (score >= 8 && email && status.includes('verified')) {
    found.push({
      company: row[0],
      score: score,
      name: row[2],
      title: row[3],
      email: email,
      status: row[5],
      lastContacted: lastContacted || 'Never'
    });
  }
}

console.log(`Found ${found.length} qualified contacts`);
found.slice(0, 10).forEach((c, i) => {
  console.log(`\n${i+1}. ${c.company} - ${c.name}`);
  console.log(`   Title: ${c.title}`);
  console.log(`   Email: ${c.email}`);
  console.log(`   Score: ${c.score} | Last: ${c.lastContacted}`);
});

fs.writeFileSync('qualified-contacts.json', JSON.stringify(found, null, 2));
console.log(`\n✓ Saved ${found.length} contacts to qualified-contacts.json`);
