const fs = require('fs');

// Read the sheet data
const sheetData = JSON.parse(fs.readFileSync('./sheet-data-march5-5am.json', 'utf8'));

console.log('=== Finding Better PE Targets - March 5, 5:36 AM ===\n');

// Skip header row
const rows = sheetData.slice(1);

// Find firms that:
// 1. Have a real company name (not placeholders)
// 2. Have status that suggests they're worth targeting (Partial, empty, or need better contacts)
// 3. Have a website
// 4. Don't have "Dead" in status
const goodTargets = rows.filter((row, idx) => {
  const company = row[0] || '';
  const website = row[1] || row[5] || '';
  const contactName = row[2] || '';
  const email = row[4] || '';
  const status = row[9] || '';
  
  // Skip Dead leads
  if (status.includes('Dead')) {
    return false;
  }
  
  // Skip already Contacted/Sent/Replied
  if (['Contacted', 'Sent', 'Replied'].includes(status)) {
    return false;
  }
  
  // Must have company and website
  if (!company || !website || website === 'N/A') {
    return false;
  }
  
  // Look for firms with generic/placeholder contacts
  const hasPlaceholderContact = contactName === 'Jacob Zodikoff' || contactName === 'Christopher R. Hansen';
  const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|support)@/i);
  const noEmail = !email || email.trim().length === 0;
  
  // Need enrichment if placeholder contact OR generic/no email
  return hasPlaceholderContact || hasGenericEmail || noEmail;
});

console.log(`Total valid PE firms needing enrichment: ${goodTargets.length}\n`);

// Filter for firms with real domain names (avoid placeholder URLs)
const enrichableTargets = goodTargets.filter(row => {
  const website = row[1] || row[5] || '';
  // Must have proper HTTP/HTTPS URL
  return website.match(/^https?:\/\/.+\..+/i);
}).slice(0, 15);

console.log('=== TOP 15 ENRICHABLE PE FIRMS ===\n');
enrichableTargets.forEach((row, idx) => {
  const company = row[0];
  const website = row[1] || row[5];
  const contactName = row[2] || 'EMPTY';
  const email = row[4] || 'EMPTY';
  const status = row[9] || 'N/A';
  const sector = row[7] || 'N/A';
  
  console.log(`${idx + 1}. ${company}`);
  console.log(`   Website: ${website}`);
  console.log(`   Sector: ${sector}`);
  console.log(`   Contact: ${contactName}`);
  console.log(`   Email: ${email}`);
  console.log(`   Status: ${status}`);
  console.log('');
});

// Save for enrichment
const enrichmentTargets = enrichableTargets.map(row => ({
  company: row[0],
  website: row[1] || row[5],
  sector: row[7] || '',
  currentContact: row[2],
  currentEmail: row[4],
  status: row[9]
}));

fs.writeFileSync(
  './enrichment-targets-better-march5.json',
  JSON.stringify(enrichmentTargets, null, 2)
);

console.log('\n=== Saved to enrichment-targets-better-march5.json ===');
