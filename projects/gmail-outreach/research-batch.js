// Firms to research - prioritized list of actual mid-market PE firms needing enrichment
const targetFirms = [
  {
    name: 'Wildcat Capital Management',
    website: 'http://www.wildcatcap.com',
    row: 811,
    notes: 'David Bonderman mentioned in sheet (TPG founder) - likely different Wildcat'
  },
  {
    name: 'Victoria Capital Partners',
    website: 'http://www.victoriacp.com',
    row: 809,
    currentContact: 'Mr. García',
    currentEmail: 'admin@victoriacp.com'
  },
  {
    name: '26North',
    website: 'http://www.26n.com',
    row: 815
  },
  {
    name: '414 Capital',
    website: 'http://www.414c.com',
    row: 816
  },
  {
    name: 'Yellowstone Capital Partners, LLC',
    website: 'http://www.yellowstonecapital.com',
    row: 813
  },
  {
    name: 'Trinity Investors',
    website: 'http://www.trinityinvestors.com',
    row: 806,
    currentEmail: 'clientrelations@trinityinvestors.com'
  },
  {
    name: 'TriplePoint Capital',
    website: 'http://www.triplepointcapital.com',
    row: 807
  }
];

console.log('TARGET FIRMS FOR ENRICHMENT:');
console.log('============================\n');

targetFirms.forEach((firm, idx) => {
  console.log(`${idx + 1}. ${firm.name} (Row ${firm.row})`);
  console.log(`   Website: ${firm.website}`);
  if (firm.currentContact) console.log(`   Current: ${firm.currentContact}`);
  if (firm.currentEmail) console.log(`   Email: ${firm.currentEmail}`);
  if (firm.notes) console.log(`   Notes: ${firm.notes}`);
  console.log();
});

console.log(`Total: ${targetFirms.length} firms to research`);
