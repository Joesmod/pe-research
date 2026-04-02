// Key contacts identified - search for LinkedIn URLs
const contacts = [
  { name: 'Blair Richardson', firm: 'Bow River Capital', title: 'CEO' },
  { name: 'Justin Ishbia', firm: 'Shore Capital Partners', title: 'Founder & Managing Partner' },
  { name: 'Patrick Lally', firm: 'Petrichor Healthcare Capital', title: 'Partner' },
  { name: 'Adam Feinstein', firm: 'Vesey Street Capital Partners', title: 'Managing Partner' },
  { name: 'Chris Sugden', firm: 'Edison Partners', title: 'Managing Partner' },
  { name: 'Simon Bachleda', firm: 'Revelstoke Capital Partners', title: 'Founder & Managing Partner' },
  { name: 'Russell Cassella', firm: 'Revelstoke Capital Partners', title: 'Managing Partner' }
];

console.log('Contacts identified for enrichment:');
console.log('====================================\n');

contacts.forEach((c, i) => {
  console.log(`${i+1}. ${c.name}`);
  console.log(`   Firm: ${c.firm}`);
  console.log(`   Title: ${c.title}`);
  console.log(`   LinkedIn search: site:linkedin.com "${c.name}" "${c.firm}"`);
  console.log('');
});

console.log('\nStatus: Names and titles identified from official firm websites.');
console.log('Next: Search for LinkedIn URLs and verify email addresses from official sources.');
