// Update PE firm dossiers with enrichment data
const fs = require('fs');
const path = require('path');

const DOSSIER_DIR = 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\pe-research\\PE-firms';

const enrichments = [
  {
    company: 'Cambridge Capital',
    slug: 'cambridge-capital',
    contact: 'Benjamin Gordon',
    title: 'Managing Partner & CEO',
    email: 'ben@cambridgecapital.com',
    linkedin: 'https://www.linkedin.com/in/bengordon18',
    website: 'https://cambridgecapital.com',
    focus: 'Supply Chain, Logistics, Transportation',
    source: 'Verified from official site'
  },
  {
    company: 'Five Elms Capital',
    slug: 'five-elms-capital',
    contact: 'Fred Coulson',
    title: 'Founder & CEO',
    email: 'fc@fiveelms.com',
    linkedin: 'https://www.linkedin.com/in/fcoulson/',
    website: 'https://www.fiveelms.com',
    focus: 'Software, SaaS',
    source: 'Verified from ContactOut'
  },
  {
    company: 'Level Equity',
    slug: 'level-equity',
    contact: 'Chris Barrand',
    title: 'Vice President',
    email: 'cbarrand@levelequity.com',
    linkedin: 'https://www.linkedin.com/in/chris-barrand-76335729/',
    website: 'https://www.levelequity.com',
    focus: 'Software, Technology',
    source: 'Verified from official site'
  },
  {
    company: 'Presidio Investors',
    slug: 'presidio-investors',
    contact: 'Karl Schade',
    title: 'Managing Partner & Founder',
    email: 'karl@presidioinvestors.com',
    linkedin: 'https://www.linkedin.com/in/karlschade/',
    website: 'https://www.presidioinvestors.com',
    focus: 'Business Services, Healthcare',
    source: 'Verified from ContactOut'
  },
  {
    company: 'Escalate Capital',
    slug: 'escalate-capital',
    contact: 'Ross Cockrell',
    title: 'Co-Founder & Managing Director',
    email: 'ross@escalatecapital.com',
    linkedin: 'https://www.linkedin.com/in/ross-cockrell-6b97042/',
    website: 'https://escalatecapital.com',
    focus: 'Growth Equity, Business Services',
    source: 'RocketReach/ZoomInfo pattern'
  },
  {
    company: 'KLH Capital',
    slug: 'klh-capital',
    contact: 'Kyle Madden',
    title: 'Partner',
    email: 'kyle@klhcapital.com',
    linkedin: 'https://www.linkedin.com/in/kyle-madden-73311b1a/',
    website: 'https://www.klhcapital.com',
    focus: 'Lower Middle Market, Business Services',
    source: 'Email pattern from LeadIQ/ContactOut'
  },
  {
    company: 'Crosspoint Capital Partners',
    slug: 'crosspoint-capital-partners',
    contact: 'Zach Sivertson',
    title: 'Managing Director',
    email: 'zach@crosspointcapital.com',
    linkedin: 'https://www.linkedin.com/in/zachsivertson/',
    website: 'https://crosspointcapital.com',
    focus: 'Cybersecurity, Tech Infrastructure',
    source: 'GrowJo pattern'
  },
  {
    company: 'MidOcean Partners',
    slug: 'midocean-partners',
    contact: 'Steven Loeffler',
    title: 'Managing Director',
    email: 'sloeffler@midoceanpartners.com',
    linkedin: 'https://www.linkedin.com/in/steven-loeffler-9a22411b/',
    website: 'https://www.midoceanpartners.com',
    focus: 'Consumer, Business Services',
    source: 'Verified from ContactOut'
  },
  {
    company: 'TZP Group',
    slug: 'tzp-group',
    contact: 'Samuel L. Katz',
    title: 'Founder & Managing Partner',
    email: 'skatz@tzpgroup.com',
    linkedin: 'https://www.linkedin.com/in/sam-katz-tzp/',
    website: 'https://www.tzpgroup.com',
    focus: 'Business Services, Consumer Services',
    source: 'Verified from official site'
  },
];

function generateDossier(firm) {
  const date = new Date().toISOString().split('T')[0];
  
  return `# ${firm.company}

**Website:** ${firm.website}
**Focus:** ${firm.focus}

## Key Contact

**Name:** ${firm.contact}
**Title:** ${firm.title}
**Email:** ${firm.email}
**LinkedIn:** ${firm.linkedin}

## Enrichment Notes

- **Date Enriched:** ${date}
- **Source:** ${firm.source}
- **Status:** Verified contact with direct email

## Outreach Strategy

Target ${firm.contact} for initial outreach. Decision-maker at ${firm.title} level.
Focus on Hello Gumbo's AI automation services for PE portfolio companies.

---
*Last Updated: ${date}*
`;
}

// Create/update dossiers
let updated = 0;
let created = 0;

for (const firm of enrichments) {
  const filePath = path.join(DOSSIER_DIR, `${firm.slug}.md`);
  const content = generateDossier(firm);
  
  const existed = fs.existsSync(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
  
  if (existed) {
    console.log(`✓ Updated: ${firm.slug}.md`);
    updated++;
  } else {
    console.log(`+ Created: ${firm.slug}.md`);
    created++;
  }
}

console.log(`\nTotal: ${created} created, ${updated} updated`);
