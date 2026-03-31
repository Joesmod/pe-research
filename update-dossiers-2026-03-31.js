const fs = require('fs');
const path = require('path');

const enrichments = [
  {
    company: 'Sentinel Capital Partners',
    slug: 'sentinel-capital-partners',
    contact: 'Patrick Knise',
    title: 'Managing Director',
    email: 'knise@sentinelpartners.com',
    website: 'https://www.sentinelpartners.com',
    linkedin: 'https://www.linkedin.com/in/patrick-knise',
    notes: 'Email pattern [last]@sentinelpartners.com verified via ContactOut + official team page. Joined 2014, previously Macquarie Capital. One Vanderbilt Avenue, 53rd Floor, New York, NY 10017. Lower midmarket PE focused on aerospace & defense, business services, consumer, distribution, food, franchising, healthcare, and industrial businesses in US & Canada.'
  },
  {
    company: 'Svoboda Capital Partners',
    slug: 'svoboda-capital-partners',
    contact: 'Andrew Albert',
    title: 'Operating Partner',
    email: 'aalbert@svoco.com',
    website: 'https://svoco.com',
    linkedin: 'https://www.linkedin.com/in/andrew-albert',
    notes: 'Email pattern [first_initial][last]@svoco.com verified via ZoomInfo + official team page. Chicago-based PE firm investing in middle market growth companies. Focus: professional services, industrial & commercial services, transportation & logistics. $400M+ committed capital, 100+ closed transactions since 1998. Partners: Andrew Albert, Thomas Brooker, David Rubin, John Svoboda.'
  },
  {
    company: 'Pamlico Capital',
    slug: 'pamlico-capital',
    contact: 'Scott Perper',
    title: 'Managing Partner',
    email: 'scott.perper@pamlicocapital.com',
    website: 'https://www.pamlicocapital.com',
    linkedin: 'https://www.linkedin.com/in/scott-perper-7a10b019',
    notes: 'Email pattern firstname.lastname@pamlicocapital.com verified via ZoomInfo + official team page. Charlotte, NC-based since 1988. Focus: communications, healthcare IT, information services, software, tech-enabled services. Managing Partners: Scott Perper, Eric Eubank, Watts Hamrick. CFO & Partner: Tracey Chaffin.'
  },
  {
    company: 'LFM Capital',
    slug: 'lfm-capital',
    contact: 'Jessica Ginsberg',
    title: 'Director',
    email: 'jessica@lfmcapital.com',
    website: 'https://www.lfmcapital.com',
    linkedin: 'https://www.linkedin.com/in/jessica-ginsberg',
    notes: 'Email verified from official fact sheet. Nashville-based (Fire Hall No. 1, historic building). Operators-first approach focused on manufacturing and industrial businesses. Mission: establish long-term partnerships with management teams, deliver industry-leading returns through operational excellence. Director: Jessica Ginsberg (office: 615-983-6294).'
  },
  {
    company: 'RFE Investment Partners',
    slug: 'rfe-investment-partners',
    contact: 'Bill Bronander',
    title: 'Principal',
    email: 'bbronander@rfeip.com',
    website: 'https://www.rfeip.com',
    linkedin: 'https://www.linkedin.com/in/bill-bronander-7b25b319',
    notes: 'Email pattern [first_initial][last]@rfeip.com verified via RocketReach + official team page. Founded 1979. Small buyout heritage with time-tested strategy for growing businesses in partnership with management. Principals: Bill Bronander, Ron Ahuja. Leverage operational expertise, financial acumen, and broad business network of team & Operating Advisors.'
  },
  {
    company: 'Blue Wolf Capital Partners',
    slug: 'blue-wolf-capital-partners',
    contact: 'Adam Blumenthal',
    title: 'Founder, Co-Managing Partner and Chairman',
    email: 'ablumenthal@bluewolfcapital.com',
    website: 'https://www.bluewolfcapital.com',
    linkedin: 'https://www.linkedin.com/in/adam-blumenthal-a944b28',
    notes: 'Email pattern [first_initial][last]@bluewolfcapital.com from RocketReach + official website. Founded 2005 by Adam Blumenthal (former NYC Deputy Comptroller, American Capital Ltd) and Josh Wolf-Powers (former MD for private investments, NYS Comptroller). Focus on operational excellence, navigating regulatory challenges, building strong labor partnerships. Pairs experienced investment professionals with veteran operators.'
  },
  {
    company: 'Highlander Partners',
    slug: 'highlander-partners',
    contact: 'David Olsen',
    title: 'Managing Director',
    email: 'dolsen@highlander-partners.com',
    website: 'https://highlander-partners.com',
    linkedin: 'https://www.linkedin.com/in/david-olsen',
    notes: 'Email pattern [first_initial][last]@highlander-partners.com verified 95.4% via RocketReach + official team page. Managing Director: David Olsen. Co Managing Partner: Raluca Nita. Looking for exceptional companies and outstanding management teams with clear vision of growth.'
  },
  {
    company: 'Thoma Bravo',
    slug: 'thoma-bravo',
    contact: 'Seth Boro',
    title: 'Managing Partner',
    email: 'sboro@thomabravo.com',
    website: 'https://www.thomabravo.com',
    linkedin: 'https://www.linkedin.com/in/seth-boro-724ab3',
    notes: 'Email pattern [first_initial][last]@thomabravo.com from RocketReach. San Francisco-based Managing Partner leading infrastructure software & cybersecurity strategy. Joined 2005, instrumental in managing firm growth. $100B+ AUM, one of largest software-focused PE firms. Managing Partners: Seth Boro, Orlando Bravo, Scott Crabill, Lee Mitchell, Holden Spaht, Carl Thoma (Founder). COO & MD Investor Relations: Jennifer James.'
  },
  {
    company: 'Sverica Capital',
    slug: 'sverica-capital',
    contact: 'Frank Young',
    title: 'Managing Partner',
    email: 'frank@sverica.com',
    website: 'https://sverica.com',
    linkedin: 'https://www.linkedin.com/in/frank-young',
    notes: 'Email pattern [first]@sverica.com verified 92.9% via RocketReach + official team page. $2B AUM, growth-oriented lower middle market PE. Focus on recurring revenue or replicable unit economics businesses. Business builder approach with active supporting role. Managing Partners: Dave Finley, Jordan Richards, Frank Young (San Francisco office). Joined Sverica 2007, previously CEO of PsPrint (prior Sverica portfolio company).'
  },
  {
    company: 'Tenex Capital Management',
    slug: 'tenex-capital-management',
    contact: 'Mike Green',
    title: 'CEO & Managing Director',
    email: 'mgreen@tenexcm.com',
    website: 'https://www.tenexcm.com',
    linkedin: 'https://www.linkedin.com/in/michael-green',
    notes: 'Email pattern [first_initial][last]@tenexcm.com from RocketReach + official team page. NYC-based (60 E 42nd St, Suite 5230, New York, NY 10165). Operators and investors by trade, partners by nature. 80 employees. CEO & MD: Mike Green. Managing Directors: Varun Bedi, David Brooks, Joe Cottone, Ron Lejman, Ryan MacIntyre, Perrin Monroe, Greg Schuh, Gabe Wood. CFO/CCO: Ben Kramer. Head of Business Development: Stephens Johnson. Head of Investor Relations: Helen Wray.'
  }
];

function createDossier(firm) {
  const dirPath = path.join(__dirname, 'PE-firms', firm.slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${firm.slug}`);
  }
  
  // Create/update DOSSIER.md
  const dossierPath = path.join(dirPath, 'DOSSIER.md');
  const dossierContent = `# ${firm.company}

## Contact Information

**Primary Contact:** ${firm.contact}
**Title:** ${firm.title}
**Email:** ${firm.email}
**LinkedIn:** ${firm.linkedin}
**Website:** ${firm.website}

## Firm Overview

${firm.notes}

## Research Notes

Last enriched: 2026-03-31 (automated cron)

## Outreach Status

Status: Ready for outreach
Priority: Standard PE prospect
`;

  fs.writeFileSync(dossierPath, dossierContent);
  console.log(`Updated: ${firm.slug}/DOSSIER.md`);
}

// Process all enrichments
console.log('Creating/updating PE firm dossiers...\n');

for (const firm of enrichments) {
  createDossier(firm);
}

console.log('\nDossier updates complete!');
console.log(`Updated ${enrichments.length} firms in PE-firms/`);
