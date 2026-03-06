const fs = require('fs');

const needs = JSON.parse(fs.readFileSync('./truly-need-research-1136pm.json', 'utf8'));

// Filter out Jacob Zodikoff spam and other suspicious entries
const realPE = needs.filter(n => {
  const contact = (n.contactName || '').trim();
  const company = (n.company || '').toLowerCase();
  
  // Skip Jacob Zodikoff entries
  if (contact === 'Jacob Zodikoff') return false;
  
  // Skip obvious non-PE companies
  const nonPE = ['wall street', 'wefunder', 'search partners', 'prep', 'oasis'];
  if (nonPE.some(term => company.includes(term))) return false;
  
  return true;
});

console.log(`=== FILTERED TO REAL PE FIRMS ===`);
console.log(`Started with: ${needs.length}`);
console.log(`Real PE firms: ${realPE.length}\n`);

// Show first 15 for research
console.log('=== TOP 15 PE FIRMS FOR RESEARCH ===\n');
realPE.slice(0, 15).forEach((firm, idx) => {
  console.log(`${idx + 1}. ${firm.company} (Row ${firm.row})`);
  console.log(`   Contact: ${firm.contactName || 'NEED TO FIND'}`);
  console.log(`   Position: ${firm.position || 'N/A'}`);
  console.log('');
});

fs.writeFileSync('./real-pe-research-targets-1136pm.json', JSON.stringify(realPE, null, 2));
console.log(`✅ Saved ${realPE.length} real PE firms to real-pe-research-targets-1136pm.json`);
