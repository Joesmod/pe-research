const fs = require('fs');

// Read the current sheet data
const sheetData = JSON.parse(fs.readFileSync('sheet-data-march5-5am.json', 'utf8'));

// Skip header row
const rows = sheetData.slice(1);

// Identify rows needing enrichment
const needsEnrichment = [];

rows.forEach((row, index) => {
  const [company, website, contactName, title, email, , linkedin, , notes, status] = row;
  
  // Skip if already enriched or dead
  if (status === 'Enriched' || status === 'Contact Found' || status?.startsWith('Dead')) {
    return;
  }
  
  // Check if needs enrichment
  const hasPlaceholder = contactName === 'Jacob Zodikoff' || !contactName || contactName.trim() === '';
  const hasGenericEmail = !email || email.match(/^(info|sales|ir|contact|admin|support|hello)@/) || email.trim() === '';
  const noDirectContact = !email || !contactName || contactName === 'Jacob Zodikoff';
  
  if (hasPlaceholder || hasGenericEmail || noDirectContact) {
    needsEnrichment.push({
      rowIndex: index + 2, // +2 for header and 0-indexing
      company,
      website,
      currentContact: contactName,
      currentEmail: email,
      currentTitle: title,
      linkedin,
      status
    });
  }
});

console.log(`\n=== ENRICHMENT NEEDS ANALYSIS ===`);
console.log(`Total rows: ${rows.length}`);
console.log(`Needs enrichment: ${needsEnrichment.length}`);
console.log(`\nTop 15 targets for enrichment:`);

needsEnrichment.slice(0, 15).forEach((lead, i) => {
  console.log(`\n${i + 1}. ${lead.company}`);
  console.log(`   Website: ${lead.website || 'N/A'}`);
  console.log(`   Current Contact: ${lead.currentContact || 'EMPTY'}`);
  console.log(`   Current Email: ${lead.currentEmail || 'EMPTY'}`);
  console.log(`   Status: ${lead.status || 'New'}`);
});

// Save enrichment targets
fs.writeFileSync('enrichment-targets-march5-5am.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));

console.log(`\n\nSaved 15 enrichment targets to enrichment-targets-march5-5am.json`);
