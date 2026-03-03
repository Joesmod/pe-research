const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));
const header = data[0];
const rows = data.slice(1);

console.log('Firms needing enrichment (empty contact, generic email, or no email):\n');

const needsEnrichment = rows.filter((row, idx) => {
  const company = row[0] || '';
  const contact = row[1] || '';
  const email = row[3] || '';
  const status = row[8] || '';
  
  // Skip if already contacted
  if (status === 'Contacted') return false;
  
  // Need enrichment if:
  // - No contact name
  // - No email
  // - Generic email (info@, sales@, ir@, contact@)
  const hasGenericEmail = email.match(/^(info|sales|ir|contact|admin|general|inquiries|support)@/i);
  const needsWork = !contact || !email || hasGenericEmail;
  
  return needsWork;
});

console.log(`Found ${needsEnrichment.length} firms needing enrichment\n`);

needsEnrichment.slice(0, 20).forEach((row, idx) => {
  const company = row[0] || '(no name)';
  const contact = row[1] || '(empty)';
  const title = row[2] || '(empty)';
  const email = row[3] || '(empty)';
  const status = row[8] || '(empty)';
  const rowNum = rows.indexOf(row) + 2; // +2 for header row and 1-indexed
  
  console.log(`${idx + 1}. Row ${rowNum}: ${company}`);
  console.log(`   Contact: ${contact}`);
  console.log(`   Title: ${title}`);
  console.log(`   Email: ${email}`);
  console.log(`   Status: ${status}`);
  console.log('');
});
