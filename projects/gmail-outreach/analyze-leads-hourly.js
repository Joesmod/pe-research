const fs = require('fs');

// Read the latest sheet snapshot
const data = JSON.parse(fs.readFileSync('latest-sheet-clean.txt', 'utf-8'));

// Skip header row
const rows = data.slice(1);

// Find leads needing enrichment
const needsEnrichment = rows.filter(row => {
  const [company, notebookLM, contactName, title, email, website, linkedin, sector, portfolio, status] = row;
  
  // Skip if already has 'Dead' or 'Closed' status
  if (status && (status.includes('Dead') || status.includes('Closed'))) {
    return false;
  }
  
  // Check if contact name is empty
  const noContactName = !contactName || contactName.trim() === '';
  
  // Check if email is empty or generic
  const emailLower = (email || '').toLowerCase();
  const genericEmail = !email || 
                      email.trim() === '' || 
                      emailLower.startsWith('info@') || 
                      emailLower.startsWith('sales@') || 
                      emailLower.startsWith('ir@') ||
                      emailLower.startsWith('contact@') ||
                      emailLower.startsWith('invest@');
  
  return noContactName || genericEmail;
});

console.log(`Total rows: ${rows.length}`);
console.log(`Leads needing enrichment: ${needsEnrichment.length}\n`);

// Show first 15 needing enrichment
console.log('Top 15 leads needing enrichment:\n');
needsEnrichment.slice(0, 15).forEach((row, idx) => {
  const [company, notebookLM, contactName, title, email, website, linkedin] = row;
  console.log(`${idx + 1}. ${company}`);
  console.log(`   Contact: ${contactName || '(EMPTY)'}`);
  console.log(`   Email: ${email || '(EMPTY)'}`);
  console.log(`   Website: ${website}`);
  console.log('');
});

// Save to file for the enrichment process
fs.writeFileSync('enrichment-targets-hourly.json', JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
console.log('Saved top 15 targets to enrichment-targets-hourly.json');
