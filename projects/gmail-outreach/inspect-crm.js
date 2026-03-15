const fs = require('fs');

const crmDataRaw = fs.readFileSync('crm-data.json', 'utf8');
const crmData = JSON.parse(crmDataRaw.replace(/^\uFEFF/, ''));

console.log('Sheet1 rows:', crmData.sheet1.length);
console.log('Contacts rows:', crmData.contacts.length);

console.log('\nFirst 5 contacts:');
crmData.contacts.slice(0, 6).forEach((row, i) => {
  console.log(`\n[${i}]:`, JSON.stringify(row));
});

console.log('\n\nSample contact with email:');
const withEmail = crmData.contacts.find(row => row[3] && row[3].includes('@'));
console.log(JSON.stringify(withEmail, null, 2));
