const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sheet-data.json', 'utf8'));
const headers = data[0];
const rows = data.slice(1);

const needs = rows
  .map((row, index) => ({
    rowIndex: index + 2, // +2 because headers are row 1 and we're 0-indexed
    company: row[0] || '',
    contact: row[2] || '',
    title: row[3] || '',
    email: row[4] || '',
    website: row[5] || '',
    status: row[9] || ''
  }))
  .filter(r => {
    // Skip if already marked dead/researched/etc
    if (r.status && r.status.toLowerCase().includes('dead')) return false;
    if (r.status && r.status.toLowerCase().includes('duplicate')) return false;
    if (!r.company) return false; // Skip empty rows
    
    // Needs enrichment if:
    // 1. No contact name, OR
    // 2. No email OR generic email
    const noContact = !r.contact || r.contact.trim() === '';
    const noEmail = !r.email || r.email.trim() === '';
    const genericEmail = r.email && /^(info@|sales@|ir@|contact@|hello@|support@)/i.test(r.email);
    
    return noContact || noEmail || genericEmail;
  });

console.log(JSON.stringify(needs.slice(0, 20), null, 2)); // First 20 that need enrichment
console.error(`\nTotal needing enrichment: ${needs.length}`);
