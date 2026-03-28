const fs = require('fs');

// Read the sheet data
const rawData = JSON.parse(fs.readFileSync('sheet-data.json', 'utf-8'));

// Headers are in first row
const headers = rawData[0];
const rows = rawData.slice(1);

console.log(`Total rows: ${rows.length}`);
console.log(`Headers: ${headers.join(', ')}\n`);

// Find rows needing enrichment
const needsEnrichment = [];

rows.forEach((row, idx) => {
  const firm = row[0] || '';
  const contact = row[1] || '';
  const email = row[3] || '';
  const status = row[9] || '';
  
  // Check if needs enrichment
  const hasNoContact = !contact || contact === 'Kyle Stanbro'; // Kyle Stanbro appears to be a placeholder
  const hasGenericEmail = email.match(/^(info|sales|ir|contact|businessdevelopment)@/i) || !email;
  
  if ((hasNoContact || hasGenericEmail) && firm && firm !== 'Kyle Stanbro' && status !== 'Enriched') {
    needsEnrichment.push({
      rowIndex: idx + 2, // +2 because of header row and 1-indexed
      firm: firm,
      contact: contact,
      email: email,
      status: status,
      url: row[5] || row[7] || '' // Website or LinkedIn
    });
  }
});

console.log(`\nRows needing enrichment: ${needsEnrichment.length}`);

// Show first 15
console.log('\n=== TOP 15 FIRMS NEEDING ENRICHMENT ===\n');
needsEnrichment.slice(0, 15).forEach(item => {
  console.log(`Row ${item.rowIndex}: ${item.firm}`);
  console.log(`  Contact: ${item.contact || 'MISSING'}`);
  console.log(`  Email: ${item.email || 'MISSING'}`);
  console.log(`  Status: ${item.status}`);
  console.log(`  URL: ${item.url}`);
  console.log('');
});

// Save full list
fs.writeFileSync('needs-enrichment.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`Full list saved to needs-enrichment.json`);
