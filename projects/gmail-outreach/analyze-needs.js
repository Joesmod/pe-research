const fs = require('fs');

// Read the CRM data, strip BOM if present
let rawData = fs.readFileSync('crm-data.json', 'utf8');
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}
const crmData = JSON.parse(rawData);
const sheet1 = crmData.sheet1;

// Skip header row
const rows = sheet1.slice(1);

// Find rows that need enrichment
const needsEnrichment = [];

rows.forEach((row, idx) => {
  const [company, contactName, title, email, website, linkedin, sector, portfolio, status] = row;
  
  // Check if needs enrichment: empty contact name OR generic email
  const hasNoContact = !contactName || contactName.trim() === '';
  const hasGenericEmail = email && (
    email.toLowerCase().startsWith('info@') ||
    email.toLowerCase().startsWith('sales@') ||
    email.toLowerCase().startsWith('ir@') ||
    email.toLowerCase().startsWith('contact@') ||
    email.toLowerCase().startsWith('admin@')
  );
  
  // Skip dead, duplicate, or contacted leads
  const statusLower = (status || '').toLowerCase();
  const isDead = statusLower.includes('dead') || statusLower.includes('duplicate');
  const isContacted = statusLower.includes('contacted');
  
  if ((hasNoContact || hasGenericEmail) && company && company.trim() !== '' && !isDead && !isContacted) {
    needsEnrichment.push({
      rowIndex: idx + 2, // +2 because: +1 for header, +1 for 1-indexed
      company,
      contactName: contactName || '(empty)',
      email: email || '(empty)',
      website,
      linkedin,
      status: status || 'Unresearched',
      reason: hasNoContact ? 'No contact name' : 'Generic email'
    });
  }
});

// Sort by priority: completely empty first, then generic emails
needsEnrichment.sort((a, b) => {
  if (a.contactName === '(empty)' && b.contactName !== '(empty)') return -1;
  if (a.contactName !== '(empty)' && b.contactName === '(empty)') return 1;
  return 0;
});

// Take first 15
const targetLeads = needsEnrichment.slice(0, 15);

console.log(JSON.stringify({
  total: needsEnrichment.length,
  targets: targetLeads
}, null, 2));
