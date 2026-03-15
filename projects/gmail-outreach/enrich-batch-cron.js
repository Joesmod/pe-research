const fs = require('fs');

// Manual enrichment findings from research
const enrichments = [
  {
    company: "First Trust Capital Management L.P.",
    contactName: "Michael Peck, CFA",
    title: "CEO, Co-Chief Investment Officer",
    email: "",  // Could not verify - only inferred pattern
    linkedIn: "https://www.linkedin.com/in/michael-peck-cfa-646b1a4/",
    notes: "Team page: firsttrustcapital.com/our-team/. Email pattern {first_initial}{last}@firsttrustcapital.com per ContactOut (mpeck@firsttrustcapital.com unverified). Source: firsttrustcapital.com team page"
  },
  {
    company: "King Street Capital Management",
    contactName: "Brian J. Higgins",
    title: "Founder, Managing Partner",
    email: "",  // Could not verify - only inferred pattern
    linkedIn: "https://www.linkedin.com/in/brian-higgins-king-street/",
    notes: "Managing $30B AUM. Email pattern {first_initial}{last}@kingstreet.com per RocketReach (bhiggins@kingstreet.com unverified). Source: kingstreet.com/Team/Brian-Higgins"
  },
  {
    company: "Mercury Fund",
    contactName: "Blair Garrou",
    title: "Co-Founder, Managing Partner",
    email: "blair@mercuryfund.com",
    linkedIn: "https://www.linkedin.com/in/bgarrou/",
    notes: "Found on ContactOut: blair@mercuryfund.com. Also teaches at Rice University. Source: mercuryfund.com/team/blair-garrou + ContactOut"
  },
  {
    company: "Lowercarbon Capital",
    contactName: "Chris Sacca",
    title: "Co-Founder, Managing Partner",
    email: "",  // Could not verify
    linkedIn: "https://www.linkedin.com/in/chrissacca/",
    notes: "Climate tech focused. RocketReach shows c******@lowercarboncapital.com but unverified. Source: lowercarbon.com/team/chris-sacca"
  }
];

console.log('=== ENRICHMENT BATCH REPORT ===\n');
console.log(`Total enrichments: ${enrichments.length}\n`);

enrichments.forEach((e, idx) => {
  console.log(`${idx + 1}. ${e.company}`);
  console.log(`   Contact: ${e.contactName}`);
  console.log(`   Title: ${e.title}`);
  console.log(`   Email: ${e.email || 'NOT FOUND - pattern inferred only'}`);
  console.log(`   LinkedIn: ${e.linkedIn}`);
  console.log(`   Notes: ${e.notes}`);
  console.log('');
});

fs.writeFileSync('enrichment-batch-cron.json', JSON.stringify(enrichments, null, 2));
console.log('Saved to enrichment-batch-cron.json');

console.log('\n=== NEXT STEPS ===');
console.log('1. Only Mercury Fund has a verified email from third-party source');
console.log('2. Other firms need deeper research or Apollo API enrichment');
console.log('3. Recommend using Apollo API for bulk email verification');
