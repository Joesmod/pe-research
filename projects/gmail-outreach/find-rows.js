const fs = require('fs');

// Read the CRM data, strip BOM if present
let rawData = fs.readFileSync('crm-data.json', 'utf8');
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}
const crmData = JSON.parse(rawData);
const sheet1 = crmData.sheet1;

const companiesNeeded = [
  'Hunter Point Capital LP',
  'IEQ Capital',
  'Invictus Growth Partners',
  'Karmel Capital',
  'Hildred Capital',
  'Keystone Capital'
];

console.log('Finding row indices for enriched companies:\n');

companiesNeeded.forEach(companyName => {
  const rowIndex = sheet1.findIndex((row, idx) => {
    if (idx === 0) return false; // Skip header
    return row[0] && row[0].trim() === companyName;
  });
  
  if (rowIndex !== -1) {
    const actualRow = rowIndex + 1; // +1 for 1-indexed sheets
    console.log(`${companyName}: Row ${actualRow}`);
    console.log(`  Current data: ${JSON.stringify(sheet1[rowIndex].slice(0, 5))}`);
  } else {
    console.log(`${companyName}: NOT FOUND`);
  }
});
