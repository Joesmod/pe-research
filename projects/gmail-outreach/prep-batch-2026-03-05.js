// Prep batch for 2026-03-05 PE outreach
const crmData = require('./crm-snapshot.json');

// Parse CRM data
const sheet1 = crmData.sheet1;
const contacts = crmData.contacts;

// Find headers
const sheet1Headers = sheet1[0];
const contactsHeaders = contacts[0];

console.log('Sheet1 headers:', sheet1Headers);
console.log('Contacts headers:', contactsHeaders);

// Helper to parse date
function daysSince(dateStr) {
  if (!dateStr || dateStr === '') return 9999;
  const date = new Date(dateStr);
  if (isNaN(date)) return 9999;
  const now = new Date('2026-03-05');
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

// Parse contacts
const contactsList = [];
for (let i = 1; i < contacts.length; i++) {
  const row = contacts[i];
  const company = row[0];
  const score = parseInt(row[1]) || 0;
  const contact = row[2];
  const position = row[3];
  const email = row[4];
  const status = row[5];
  const lastContacted = row[8]; // Column I
  const notes = row[7] || '';
  
  const daysSinceContact = daysSince(lastContacted);
  
  contactsList.push({
    company,
    score,
    contact,
    position,
    email,
    status,
    lastContacted,
    daysSinceContact,
    notes
  });
}

// Filter for qualified contacts
const qualified = contactsList.filter(c => {
  // Must have verified email
  if (c.status !== 'verified' && c.status !== 'Verified') return false;
  
  // Must have score >= 8
  if (c.score < 8) return false;
  
  // Must not be contacted in last 7 days
  if (c.daysSinceContact < 7) return false;
  
  // Must have email
  if (!c.email || c.email.includes('DEAD END')) return false;
  
  return true;
});

// Prioritize tech/AI/value creation roles
function priorityScore(position) {
  const pos = (position || '').toLowerCase();
  let score = 0;
  
  if (pos.includes('cto') || pos.includes('chief technology')) score += 10;
  if (pos.includes('chief ai') || pos.includes('ai officer')) score += 10;
  if (pos.includes('vp product') || pos.includes('head of technology')) score += 8;
  if (pos.includes('operating partner') && pos.includes('tech')) score += 8;
  if (pos.includes('head of digital') || pos.includes('transformation')) score += 7;
  if (pos.includes('value creation')) score += 6;
  if (pos.includes('portfolio operations') || pos.includes('portfolio growth')) score += 6;
  if (pos.includes('managing director') || pos.includes('partner')) score += 3;
  if (pos.includes('business development')) score += 2;
  
  return score;
}

// Sort by priority
qualified.sort((a, b) => {
  const scoreA = priorityScore(a.position) + (a.score / 10);
  const scoreB = priorityScore(b.position) + (b.score / 10);
  return scoreB - scoreA;
});

// Group by company and take top 25 companies (max 1 contact per company)
const seenCompanies = new Set();
const top25 = [];
for (const contact of qualified) {
  if (seenCompanies.has(contact.company)) continue;
  seenCompanies.add(contact.company);
  top25.push(contact);
  if (top25.length >= 25) break;
}

console.log('\n=== TOP 25 CONTACTS ===\n');
top25.forEach((c, i) => {
  console.log(`${i + 1}. ${c.company} - ${c.contact} (${c.position})`);
  console.log(`   Email: ${c.email}`);
  console.log(`   Score: ${c.score}, Last contacted: ${c.lastContacted || 'Never'} (${c.daysSinceContact} days ago)`);
  console.log('');
});

// Save to file
const fs = require('fs');
fs.writeFileSync('./top25-2026-03-05.json', JSON.stringify(top25, null, 2));

console.log(`\nSaved ${top25.length} contacts to top25-2026-03-05.json`);
