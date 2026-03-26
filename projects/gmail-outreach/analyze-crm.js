const fs = require('fs');
const data = JSON.parse(fs.readFileSync('crm-data.json', 'utf8'));

console.log('=== CRM Data Structure ===\n');
console.log('Total Sheet1 rows:', data.sheet1.length);
console.log('Total Contacts rows:', data.contacts.length);

console.log('\n=== First 3 rows of Sheet1 ===');
for (let i = 0; i < Math.min(3, data.sheet1.length); i++) {
  const row = data.sheet1[i];
  console.log(`\nRow ${i}:`);
  console.log('  [0] Company:', row[0]);
  console.log('  [1] Score/Field:', row[1]);
  console.log('  [2] Name:', row[2]);
  console.log('  [3] Title:', row[3]);
  console.log('  [4] Email:', row[4]);
  console.log('  [5] Email Status:', row[5]);
  console.log('  [9] Last Contacted:', row[9]);
}

// Find rows with Gumbo Score >= 8 and verified emails
console.log('\n=== Sample high-score verified contacts ===');
let count = 0;
for (let i = 1; i < data.sheet1.length && count < 5; i++) {
  const row = data.sheet1[i];
  const score = parseInt(row[1]);
  const email = row[4];
  const status = row[5] || '';
  
  if (score >= 8 && email && status.toLowerCase().includes('verified')) {
    count++;
    console.log(`\n${count}. ${row[0]} - ${row[2]} (${row[3]})`);
    console.log(`   Email: ${email} | Status: ${status} | Score: ${score}`);
    console.log(`   Last Contacted: ${row[9] || 'Never'}`);
  }
}

console.log(`\nFound ${count} sample contacts with score >= 8 and verified emails`);
