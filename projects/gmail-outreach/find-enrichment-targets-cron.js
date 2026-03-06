const fs = require('fs');
const data = JSON.parse(fs.readFileSync('current-sheet-data.json', 'utf8'));

const genericEmailPatterns = /^(info@|contact@|sales@|ir@|admin@|support@)/i;

// Skip header
const rows = data.slice(1);

const needsEnrichment = rows.map((row, idx) => {
  const rowNum = idx + 2; // +2 because: +1 for header, +1 for 1-indexed
  const [company, notebookLM, contactName, title, email, website, linkedin, sector, portfolio, status, lastContacted, notes, companyInfo] = row;
  
  // Needs enrichment if:
  // 1. Missing contact name
  // 2. Missing email
  // 3. Generic email pattern
  // 4. Status is not "Contacted" or "Enriched"
  
  const missingContact = !contactName || contactName.trim() === '';
  const missingEmail = !email || email.trim() === '';
  const hasGenericEmail = email && genericEmailPatterns.test(email);
  const notEnriched = status !== 'Enriched' && status !== 'Contacted';
  
  if ((missingContact || missingEmail || hasGenericEmail) && company) {
    return {
      rowNum,
      company,
      website,
      contactName: contactName || '',
      email: email || '',
      status: status || '',
      reason: missingContact ? 'Missing contact name' : 
              missingEmail ? 'Missing email' : 
              hasGenericEmail ? 'Generic email' : 'Other',
      linkedin,
      notebookLM
    };
  }
  return null;
}).filter(x => x !== null);

console.log(`Total rows needing enrichment: ${needsEnrichment.length}`);
console.log(`\nFirst 20 targets:`);
needsEnrichment.slice(0, 20).forEach(target => {
  console.log(`\nRow ${target.rowNum}: ${target.company}`);
  console.log(`  Current: ${target.contactName || '(no name)'} - ${target.email || '(no email)'}`);
  console.log(`  Reason: ${target.reason}`);
  console.log(`  Website: ${target.website || '(none)'}`);
});

fs.writeFileSync('enrichment-targets-march4-7am.json', JSON.stringify(needsEnrichment, null, 2));
console.log(`\nSaved ${needsEnrichment.length} targets to enrichment-targets-march4-7am.json`);
