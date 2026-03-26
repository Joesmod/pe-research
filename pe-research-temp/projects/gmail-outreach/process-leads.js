const fs = require('fs');

// Parse the CRM data
const crmData = JSON.parse(fs.readFileSync('crm-data.json', 'utf8'));

const today = new Date('2026-03-03');
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

console.log(`Today: ${today.toISOString().split('T')[0]}`);
console.log(`7 days ago: ${sevenDaysAgo.toISOString().split('T')[0]}`);

// Process contacts
const contacts = crmData.contacts.slice(1); // Skip header row
const sheet1 = crmData.sheet1.slice(1); // Skip header row

const qualified = [];

contacts.forEach(row => {
  const [company, score, name, title, email, status, linkedin, notes, lastContacted] = row;
  
  // Skip if no email or not verified
  if (!email || status !== 'verified') return;
  
  // Skip if Gumbo Score < 8 (treat empty as 0)
  const gumboScore = parseInt(score) || 0;
  if (gumboScore < 8) return;
  
  // Check if contacted in last 7 days
  if (lastContacted) {
    const contactDate = new Date(lastContacted);
    if (contactDate > sevenDaysAgo) {
      console.log(`SKIP: ${company} (${name}) - contacted ${lastContacted}`);
      return;
    }
  }
  
  // Check Sheet1 for company last contact
  const sheet1Entry = sheet1.find(s => s[0] === company);
  if (sheet1Entry && sheet1Entry[9]) { // Column J is index 9
    const sheetContactDate = new Date(sheet1Entry[9]);
    if (sheetContactDate > sevenDaysAgo) {
      console.log(`SKIP: ${company} (${name}) - Sheet1 shows contacted ${sheet1Entry[9]}`);
      return;
    }
  }
  
  // Check for tech/AI/value creation roles
  const techRoles = [
    'cto', 'chief technology', 'chief information', 'cio', 'ciso',
    'chief ai', 'ai officer', 'head of technology', 'head of data',
    'vp product', 'vp technology', 'operating partner', 'portfolio growth',
    'value creation', 'digital transformation', 'innovation', 'software engineer',
    'data science', 'analytics'
  ];
  
  const lowerTitle = (title || '').toLowerCase();
  const hasTechRole = techRoles.some(role => lowerTitle.includes(role));
  
  qualified.push({
    company,
    name,
    title,
    email,
    score: gumboScore,
    hasTechRole,
    notes,
    linkedin,
    lastContacted: lastContacted || 'never'
  });
});

// Sort by: tech role first, then score, then alphabetically
qualified.sort((a, b) => {
  if (a.hasTechRole !== b.hasTechRole) return b.hasTechRole - a.hasTechRole;
  if (b.score !== a.score) return b.score - a.score;
  return a.company.localeCompare(b.company);
});

// Take top 25
const top25 = qualified.slice(0, 25);

console.log('\n=== TOP 25 QUALIFIED LEADS ===\n');
top25.forEach((lead, i) => {
  console.log(`${i+1}. ${lead.company} - ${lead.name} (${lead.title}) - Score: ${lead.score} ${lead.hasTechRole ? '🎯' : ''}`);
  console.log(`   Email: ${lead.email}`);
  console.log(`   Last Contacted: ${lead.lastContacted}\n`);
});

// Save to file
fs.writeFileSync('top25-leads.json', JSON.stringify(top25, null, 2));
console.log('\n✅ Saved to top25-leads.json');
