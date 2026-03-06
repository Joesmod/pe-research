const fs = require('fs');

// Read the CRM data and strip BOM if present
let rawData = fs.readFileSync('crm-data.json', 'utf8');
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}
const data = JSON.parse(rawData);
const rows = data.sheet1;

// Skip header row
const leads = rows.slice(1);

// Find leads needing enrichment
const needsEnrichment = leads.filter(row => {
  const [company, contactName, title, email, website, linkedin, sector, portfolio, status] = row;
  
  // Skip if no company name
  if (!company || company.trim() === '') return false;
  
  // Skip if already marked as Dead or Unsubscribed
  if (status && (status.includes('Dead') || status.includes('Unsubscribed'))) return false;
  
  // Need enrichment if:
  // 1. No contact name
  // 2. No email at all
  // 3. Generic email (info@, sales@, ir@, contact@, general@)
  const noContact = !contactName || contactName.trim() === '';
  const noEmail = !email || email.trim() === '';
  const genericEmail = email && (
    email.includes('info@') || 
    email.includes('sales@') || 
    email.includes('ir@') || 
    email.includes('contact@') ||
    email.includes('general@')
  );
  
  return noContact || noEmail || genericEmail;
});

console.log(`Total leads: ${leads.length}`);
console.log(`Needs enrichment: ${needsEnrichment.length}`);
console.log('\nFirst 20 needing enrichment:\n');

needsEnrichment.slice(0, 20).forEach((row, idx) => {
  const [company, contactName, title, email, website, linkedin, sector] = row;
  console.log(`${idx + 1}. ${company}`);
  console.log(`   Contact: ${contactName || '(empty)'}`);
  console.log(`   Email: ${email || '(empty)'}`);
  console.log(`   Website: ${website}`);
  console.log(`   Sector: ${sector}`);
  console.log('');
});

// Save targets to JSON for processing
const targets = needsEnrichment.slice(0, 15).map(row => ({
  company: row[0],
  contactName: row[1],
  title: row[2],
  email: row[3],
  website: row[4],
  linkedin: row[5],
  sector: row[6],
  portfolio: row[7],
  status: row[8]
}));

fs.writeFileSync('enrichment-targets-cron.json', JSON.stringify(targets, null, 2));
console.log(`\nSaved top 15 targets to enrichment-targets-cron.json`);
