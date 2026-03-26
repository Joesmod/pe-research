// Filter and prioritize PE contacts for outreach
const fs = require('fs');

// Read CRM data from the exec output
const crmData = JSON.parse(fs.readFileSync('crm-data.json', 'utf8'));

const today = new Date('2026-03-25');
const cutoff = new Date(today);
cutoff.setDate(cutoff.getDate() - 7);

// Parse contacts
const contacts = [];
const seen = new Set();

// Sheet1 data is in crmData.sheet1, Contacts data in crmData.contacts
const sheet1 = crmData.sheet1 || [];
const contactsSheet = crmData.contacts || [];

for (let i = 1; i < sheet1.length; i++) {
  const row = sheet1[i];
  if (!row || row.length < 10) continue;
  
  const company = row[0];
  const score = parseInt(row[1]) || 0;
  const name = row[2];
  const title = row[3];
  const email = row[4];
  const emailStatus = row[5] || '';
  const lastContacted = row[9]; // Column J
  
  // Skip if no email or not verified
  if (!email || emailStatus.toLowerCase().indexOf('verified') === -1) continue;
  
  // Skip if score < 8
  if (score < 8) continue;
  
  // Skip if company already seen
  if (seen.has(company)) continue;
  
  // Check last contacted date
  if (lastContacted) {
    const contactDate = new Date(lastContacted);
    if (contactDate > cutoff) {
      console.log(`Skipping ${company} (${name}): contacted ${lastContacted}`);
      continue;
    }
  }
  
  // Prioritize tech/AI/value creation roles
  const techRole = /CTO|CITO|Chief.*Tech|Head.*Tech|VP.*Tech|Technology|AI|Data|Digital|Product|Innovation|Value Creation|Portfolio.*Ops/i.test(title);
  
  contacts.push({
    company,
    score,
    name,
    title,
    email,
    techRole,
    lastContacted: lastContacted || 'Never'
  });
  
  seen.add(company);
}

// Sort: tech roles first, then by score desc
contacts.sort((a, b) => {
  if (a.techRole !== b.techRole) return a.techRole ? -1 : 1;
  if (b.score !== a.score) return b.score - a.score;
  return a.company.localeCompare(b.company);
});

// Take top 25
const top25 = contacts.slice(0, 25);

console.log(`\nFiltered ${contacts.length} qualified contacts. Top 25:\n`);
top25.forEach((c, i) => {
  console.log(`${i+1}. ${c.company} - ${c.name} (${c.title}) [Score: ${c.score}, Tech: ${c.techRole}]`);
});

fs.writeFileSync('top25-contacts.json', JSON.stringify(top25, null, 2));
console.log('\n✓ Saved to top25-contacts.json');
