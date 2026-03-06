const fs = require('fs');

// Read the sheet data - handle UTF-16LE encoding
let raw = fs.readFileSync('sheet-data-raw.json', 'utf16le');
raw = raw.replace(/^\uFEFF/, '');
const data = JSON.parse(raw);

console.log(`Total rows: ${data.length}`);

const targets = [];
const headers = data[0];

// Find indices
const companyIdx = 0;
const contactIdx = 1;
const titleIdx = 2;
const emailIdx = 3;
const websiteIdx = 4;
const linkedinIdx = 5;
const sectorIdx = 6;
const portfolioIdx = 7;
const statusIdx = 8;

// PE-related keywords to identify legitimate firms
const peKeywords = ['private equity', 'capital partners', 'capital', 'partners', 'investments', 'equity', 'pe firm', 'aum', 'portfolio'];
const excludeKeywords = ['beauty', 'cruises', 'fund impact', 'cash buyers', 'commons', 'advisors', 'waterways'];

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const company = row[companyIdx] || '';
  const contact = row[contactIdx] || '';
  const title = row[titleIdx] || '';
  const email = row[emailIdx] || '';
  const website = row[websiteIdx] || '';
  const linkedin = row[linkedinIdx] || '';
  const sector = row[sectorIdx] || '';
  const portfolio = row[portfolioIdx] || '';
  const status = row[statusIdx] || '';
  
  // Skip if duplicate, dead, or contacted
  if (status.toLowerCase().includes('duplicate') || 
      status.toLowerCase().includes('dead') || 
      status.toLowerCase().includes('contacted')) {
    continue;
  }
  
  // Check if looks like PE firm
  const companyLower = company.toLowerCase();
  const portfolioLower = portfolio.toLowerCase();
  const isPE = peKeywords.some(kw => companyLower.includes(kw) || portfolioLower.includes(kw));
  const isExcluded = excludeKeywords.some(kw => companyLower.includes(kw));
  
  if (!isPE || isExcluded) continue;
  
  // Check if needs enrichment
  const needsContact = !contact || contact.trim() === '';
  const hasGenericEmail = email && (
    email.includes('info@') || 
    email.includes('sales@') || 
    email.includes('ir@') ||
    email.includes('contact@') ||
    email.includes('admin@')
  );
  const noEmail = !email || email.trim() === '';
  
  if (needsContact || hasGenericEmail || noEmail) {
    targets.push({
      row: i + 1,
      company,
      contact: contact || '',
      title: title || '',
      email: email || '',
      website,
      linkedin,
      sector,
      portfolio,
      status,
      reason: needsContact ? 'Missing contact name' : 
              hasGenericEmail ? 'Generic email' : 
              'No email'
    });
  }
}

console.log(`\nPE firms needing enrichment: ${targets.length}`);
console.log('\n===== TOP 15 PE ENRICHMENT TARGETS =====\n');

targets.slice(0, 15).forEach((lead, idx) => {
  console.log(`${idx + 1}. ${lead.company} (Row ${lead.row})`);
  console.log(`   Contact: ${lead.contact || '(MISSING)'}`);
  console.log(`   Email: ${lead.email || '(MISSING)'}`);
  console.log(`   Website: ${lead.website}`);
  console.log(`   Status: ${lead.status}`);
  console.log(`   Reason: ${lead.reason}`);
  console.log(``);
});

// Write targets to file
fs.writeFileSync('pe-enrichment-targets.json', JSON.stringify(targets, null, 2));
console.log(`Full list of ${targets.length} targets saved to pe-enrichment-targets.json`);
