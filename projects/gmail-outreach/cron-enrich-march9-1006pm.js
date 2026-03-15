const fs = require('fs');
const needs = JSON.parse(fs.readFileSync('enrichment-needs-march9-906am.json', 'utf-8'));

// Filter for real PE firms that need enrichment
const validFirms = needs.filter(lead => {
  const status = (lead.status || '').toLowerCase();
  const firm = (lead.firm || '').toLowerCase();
  
  // Skip educational, consulting, recruiting, etc.
  if (status.includes('not a pe') || status.includes('educational') || 
      status.includes('consulting') || status.includes('recruiting') ||
      status.includes('search firm') || status.includes('executive search')) {
    return false;
  }
  
  // Must have a website or valid firm name
  if (!lead.website && !lead.firm) return false;
  
  // Priority: firms with no contact name OR generic emails
  const email = (lead.email || '').toLowerCase();
  const hasGenericEmail = email.includes('info@') || email.includes('sales@') || 
                          email.includes('ir@') || email.includes('contact@');
  const noContact = !lead.contactName || lead.contactName.trim() === '';
  
  return noContact || hasGenericEmail;
});

console.log(`\n📊 Enrichment Analysis:`);
console.log(`Total leads in file: ${needs.length}`);
console.log(`Valid PE firms needing enrichment: ${validFirms.length}`);

// Select top 15 by row index (earlier = higher priority usually)
const targets = validFirms.slice(0, 15);

console.log(`\n🎯 Top 15 Targets Selected:`);
targets.forEach((t, i) => {
  console.log(`${i+1}. ${t.firm} - ${t.website || 'no website'}`);
});

fs.writeFileSync('cron-targets-march9-1006pm.json', JSON.stringify(targets, null, 2));
console.log(`\n✅ Saved to cron-targets-march9-1006pm.json`);
