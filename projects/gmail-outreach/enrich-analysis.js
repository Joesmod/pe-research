// Parse sheet data and identify leads needing enrichment
const rawData = JSON.parse(require('fs').readFileSync('sheet-data.json', 'utf8'));

// Skip header row
const rows = rawData.slice(1);

const needsEnrichment = rows.filter((row, idx) => {
  const [company, linkedin, contactName, title, email, website, linkedinUrl, status, notes, enrichedStatus] = row;
  
  // Check if needs enrichment
  const noContact = !contactName || contactName.trim() === '';
  const genericEmail = email && (
    email.includes('info@') || 
    email.includes('sales@') || 
    email.includes('ir@') ||
    email.includes('contact@') ||
    email.includes('team@') ||
    email.trim() === ''
  );
  
  const notYetEnriched = enrichedStatus !== 'Enriched';
  
  return (noContact || genericEmail) && notYetEnriched && company;
}).map((row, idx) => {
  const [company, linkedin, contactName, title, email, website] = row;
  return {
    company,
    website,
    currentContact: contactName,
    currentEmail: email,
    rowIndex: idx + 2 // +1 for header, +1 for 1-indexed
  };
});

console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
console.log(`\n\nTotal needing enrichment: ${needsEnrichment.length}`);
