const fs = require('fs');

// Read the sheet data
const rawData = fs.readFileSync('sheet-data.json', 'utf8');
// Strip BOM if present
const cleanData = rawData.charCodeAt(0) === 0xFEFF ? rawData.slice(1) : rawData;
const sheetData = JSON.parse(cleanData);

// Skip header row
const rows = sheetData.slice(1);

// Find rows that need enrichment
const needsEnrichment = rows
  .map((row, idx) => ({
    rowIndex: idx + 2, // +2 because: skip header (1) and 0-indexed to 1-indexed
    company: row[0] || '',
    contactName: row[1] || '',
    title: row[2] || '',
    email: row[3] || '',
    website: row[4] || '',
    linkedin: row[5] || '',
    sectorFocus: row[6] || '',
    portfolioCompanies: row[7] || '',
    status: row[8] || '',
    lastContacted: row[9] || ''
  }))
  .filter(row => {
    const hasEmptyContact = !row.contactName || row.contactName.trim() === '' || row.contactName === 'Not identified';
    const hasGenericEmail = !row.email || 
      row.email.startsWith('info@') || 
      row.email.startsWith('sales@') || 
      row.email.startsWith('ir@') ||
      row.email.startsWith('contact@') ||
      row.email.trim() === '';
    const isViableStatus = row.status !== 'Contacted' && 
                          row.status !== 'Enriched' && 
                          row.status !== 'Dead Lead' && 
                          row.status !== 'DUPLICATE';
    
    return (hasEmptyContact || hasGenericEmail) && isViableStatus && row.company.trim();
  });

console.log(`Found ${needsEnrichment.length} leads needing enrichment:\n`);

// Show first 15
const top15 = needsEnrichment.slice(0, 15);
top15.forEach(lead => {
  console.log(`Row ${lead.rowIndex}: ${lead.company}`);
  console.log(`  Contact: ${lead.contactName || 'EMPTY'}`);
  console.log(`  Email: ${lead.email || 'EMPTY'}`);
  console.log(`  Website: ${lead.website}`);
  console.log(`  Status: ${lead.status || 'EMPTY'}`);
  console.log('');
});

// Write to file for enrichment processing
fs.writeFileSync('_enrich_targets_cron.json', JSON.stringify(top15, null, 2));
console.log(`\nWrote ${top15.length} targets to _enrich_targets_cron.json`);
