const fs = require('fs');

// Read the sheet data
let rawData = fs.readFileSync('sheet-output-temp.json', 'utf8');
// Remove BOM if present
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}
const data = JSON.parse(rawData);

const headers = data[0];
const rows = data.slice(1);

// Find indices
const companyIdx = headers.indexOf('Company Name');
const contactIdx = headers.indexOf('Contact Name');
const emailIdx = headers.indexOf('Email');
const statusIdx = headers.indexOf('Status');
const websiteIdx = headers.indexOf('Website');

const needsEnrichment = [];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const company = row[companyIdx] || '';
  const contact = row[contactIdx] || '';
  const email = row[emailIdx] || '';
  const status = row[statusIdx] || '';
  const website = row[websiteIdx] || '';
  
  // Skip if already marked as Dead or Sent
  if (status && (status.includes('Dead') || status.includes('Sent'))) {
    continue;
  }
  
  // Check if needs enrichment
  const hasNoContact = !contact || contact.trim() === '';
  const hasGenericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@') || email.includes('contact@');
  
  if (hasNoContact || hasGenericEmail) {
    needsEnrichment.push({
      rowIndex: i + 2, // +2 because of header and 1-indexed
      company,
      contact,
      email,
      website,
      status,
      reason: hasNoContact ? 'No contact name' : 'Generic/missing email'
    });
  }
}

console.log(JSON.stringify(needsEnrichment.slice(0, 20), null, 2));
console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
