const fs = require('fs');

const sheet1 = JSON.parse(fs.readFileSync('_sheet1_dump.json', 'utf8'));
const contacts = JSON.parse(fs.readFileSync('_contacts_dump.json', 'utf8'));

const s1Headers = sheet1[0];
const cHeaders = contacts[0];

// Parse Sheet1 into objects
const companies = sheet1.slice(1).map(row => {
  const obj = {};
  s1Headers.forEach((h, i) => obj[h] = (row[i] || '').trim());
  return obj;
});

// Parse Contacts into objects
const people = contacts.slice(1).map(row => {
  const obj = {};
  cHeaders.forEach((h, i) => obj[h] = (row[i] || '').trim());
  return obj;
});

// Build company lookup for sector/portfolio info
const companyMap = {};
companies.forEach(c => {
  companyMap[c['Company Name'].toLowerCase()] = c;
});

// 7 days ago (dynamic)
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

function wasContactedRecently(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= sevenDaysAgo;
}

// Priority titles
const priorityTitles = [
  'chief ai', 'chief technology', 'cto', 'vp product', 'vp technology',
  'operating partner', 'value creation', 'digital', 'chief digital',
  'chief information', 'chief innovation', 'vp engineering', 'technology',
  'ai officer', 'data officer'
];

function titleScore(title) {
  const t = title.toLowerCase();
  for (const p of priorityTitles) {
    if (t.includes(p)) return 10;
  }
  // Still OK titles
  if (t.includes('managing director') || t.includes('principal') || t.includes('partner')) return 5;
  return 1;
}

// Filter contacts
const eligible = people.filter(p => {
  // Must have verified email
  if (!p['Email'] || !p['Email'].includes('@')) return false;
  if (p['Email Status'] && p['Email Status'].toLowerCase() === 'invalid') return false;
  
  // Gumbo Score >= 8
  const score = parseFloat(p['Gumbo Score']);
  if (isNaN(score) || score < 8) return false;
  
  // Not contacted in last 7 days (contact level)
  if (wasContactedRecently(p['Last Contacted'])) return false;
  
  // Not contacted in last 7 days (company level)
  const compKey = p['Company'].toLowerCase();
  const comp = companyMap[compKey];
  if (comp && wasContactedRecently(comp['Last Contacted'])) return false;
  
  // Must have a name that looks like a real name (not a title)
  if (!p['Contact Name'] || p['Contact Name'].length < 3) return false;
  // Filter out rows where name looks like a title
  const name = p['Contact Name'].toLowerCase();
  if (name.includes('partner') || name.includes('director') || name.includes('vp ') || name.includes('chief')) return false;
  
  return true;
});

// Sort by Gumbo Score desc, then title priority
eligible.sort((a, b) => {
  const scoreDiff = parseFloat(b['Gumbo Score']) - parseFloat(a['Gumbo Score']);
  if (scoreDiff !== 0) return scoreDiff;
  return titleScore(b['Title']) - titleScore(a['Title']);
});

// One per company
const seen = new Set();
const selected = [];
for (const p of eligible) {
  const compKey = p['Company'].toLowerCase();
  if (seen.has(compKey)) continue;
  seen.add(compKey);
  
  // Attach company info
  const comp = companyMap[compKey] || {};
  p._sectorFocus = comp['Sector Focus'] || '';
  p._portfolio = comp['Portfolio Companies'] || '';
  p._companyNotes = comp['Notes'] || '';
  p._companyInfo = comp['Company Info URL'] || '';
  p._website = comp['Website'] || '';
  
  selected.push(p);
  if (selected.length >= 25) break;
}

console.log(`Eligible: ${eligible.length}, Selected: ${selected.length}`);
console.log(JSON.stringify(selected, null, 2));
fs.writeFileSync('_selected_contacts.json', JSON.stringify(selected, null, 2));
