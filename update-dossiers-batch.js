const fs = require('fs');
const path = require('path');

const enrichedFirms = [
  {
    slug: 'llr-partners',
    name: 'LLR Partners',
    website: 'https://www.llrpartners.com',
    contact: {
      name: 'Howard Ross',
      title: 'Partner',
      email: 'hross@llrpartners.com',
      linkedin: 'https://www.linkedin.com/in/howard-ross-a25524b7/',
      phone: '(215) 717-2901'
    },
    overview: 'Philadelphia-based lower middle-market growth capital PE firm founded in 1999. $6B+ AUM. Focus: software, healthcare IT, fintech, tech-enabled services. Known for operating expertise and value creation.',
    aum: '$6B+',
    location: 'Philadelphia, PA',
    founded: '1999',
    focus: ['Software', 'Healthcare IT', 'Fintech', 'Tech-Enabled Services'],
    notes: 'Email pattern verified via RocketReach (first+last@llrpartners.com). Partner with 20+ years PE experience. Other contacts: Ann Brophy (Sr Director BD, abrophy@llrpartners.com), Emily Oakes (Marketing, eoakes@llrpartners.com).',
    lastUpdated: '2026-04-01'
  },
  {
    slug: 'pamlico-capital',
    name: 'Pamlico Capital',
    website: 'https://www.pamlicocapital.com',
    contact: {
      name: 'Watts Hamrick',
      title: 'Senior Advisor (Former Managing Partner)',
      email: 'watts.hamrick@pamlicocapital.com',
      linkedin: 'https://www.linkedin.com/in/watts-hamrick-98912069'
    },
    overview: 'Charlotte-based PE firm founded in 1988 with 35+ years track record. $500M-$1B AUM. Focus: tech-enabled services, healthcare IT, software, communications.',
    aum: '$500M-$1B',
    location: 'Charlotte, NC',
    founded: '1988',
    focus: ['Tech-Enabled Services', 'Healthcare IT', 'Software', 'Communications'],
    notes: 'Email pattern verified via RocketReach (first.last@pamlicocapital.com, 63.7%). Watts currently serves as Senior Advisor, transitioned from Managing Partner role.',
    lastUpdated: '2026-04-01'
  },
  {
    slug: 'sverica-capital',
    name: 'Sverica Capital Management',
    website: 'https://sverica.com',
    contact: {
      name: 'Jordan Richards',
      title: 'Managing Partner',
      email: 'jrichards@sverica.com',
      linkedin: 'https://www.linkedin.com/in/jordan-richards-9514b45/'
    },
    overview: 'Growth-oriented lower middle market PE firm. $2.2B AUM. Boston + Austin + San Francisco offices. Focus on software and SaaS companies.',
    aum: '$2.2B',
    location: 'Boston, Austin, San Francisco',
    founded: 'N/A',
    focus: ['Software', 'SaaS'],
    notes: 'Email pattern verified via RocketReach. Austin-based Managing Partner with 20+ years principal investing experience. Active boards: Coastal Cloud, Gryphon.ai, Omeda, Raken, Stream Companies. Recently promoted Michael Dougherty to Partner.',
    lastUpdated: '2026-04-01'
  },
  {
    slug: 'wind-point-partners',
    name: 'Wind Point Partners',
    website: 'https://www.wppartners.com',
    contact: {
      name: 'Nathan Brown',
      title: 'Managing Director',
      email: 'nbrown@wppartners.com',
      linkedin: 'https://www.linkedin.com/in/nathan-brown-82bb71169/'
    },
    overview: 'Middle-market PE firm focused on industrial and manufacturing sectors. Based in Chicago.',
    aum: 'N/A',
    location: 'Chicago, IL',
    founded: 'N/A',
    focus: ['Industrial', 'Manufacturing'],
    notes: 'Email pattern verified via RocketReach (first_initial+last@wppartners.com). Managing Director since 1997 (27+ years tenure). Serves on 7 portfolio company boards: Central Moloney, Envera Systems, MOREgroup, Nelson Global Products, Pavion, Vertex, Voyant Beauty.',
    lastUpdated: '2026-04-01'
  },
  {
    slug: 'one-equity-partners',
    name: 'One Equity Partners',
    website: 'https://www.oneequity.com',
    contact: {
      name: 'Richard M. Cashin',
      title: 'Managing Partner',
      email: '',
      linkedin: 'https://www.crunchbase.com/person/richard-m-cashin'
    },
    overview: 'Large middle-market PE firm. $10B+ AUM. Focus: industrial, healthcare, technology sectors. Global presence with offices in NYC, Chicago, São Paulo, Vienna, Hong Kong, Frankfurt.',
    aum: '$10B+',
    location: 'New York, Chicago, São Paulo, Vienna, Hong Kong, Frankfurt',
    founded: '2001',
    focus: ['Industrial', 'Healthcare', 'Technology'],
    notes: 'Managing Partner confirmed via Crunchbase. No direct email published - general contact via website. Former merchant banking arm of JPMorgan Chase.',
    lastUpdated: '2026-04-01'
  }
];

function createDossier(firm) {
  const dirPath = path.join('PE-firms', firm.slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${firm.slug}`);
  } else {
    console.log(`→ Directory exists: ${firm.slug}`);
  }
  
  // Create DOSSIER.md
  const dossierPath = path.join(dirPath, 'DOSSIER.md');
  const dossierContent = `# ${firm.name}

**Website:** ${firm.website}  
**Location:** ${firm.location}  
**AUM:** ${firm.aum}  
**Founded:** ${firm.founded}

## Focus Areas
${firm.focus.map(f => `- ${f}`).join('\n')}

## Primary Contact
- **Name:** ${firm.contact.name}
- **Title:** ${firm.contact.title}
${firm.contact.email ? `- **Email:** ${firm.contact.email}` : '- **Email:** (Not publicly available)'}
${firm.contact.phone ? `- **Phone:** ${firm.contact.phone}` : ''}
- **LinkedIn:** ${firm.contact.linkedin}

## Overview
${firm.overview}

## Research Notes
${firm.notes}

---
**Last Updated:** ${firm.lastUpdated}  
**Source:** Official website + RocketReach + LinkedIn
`;
  
  fs.writeFileSync(dossierPath, dossierContent);
  console.log(`✓ Created/Updated DOSSIER.md for ${firm.name}`);
  
  // Create/update README.md
  const readmePath = path.join(dirPath, 'README.md');
  const readmeContent = `# ${firm.name}

${firm.overview}

**Quick Facts:**
- Website: ${firm.website}
- AUM: ${firm.aum}
- Location: ${firm.location}
- Focus: ${firm.focus.join(', ')}

**Primary Contact:** ${firm.contact.name}, ${firm.contact.title}

See [DOSSIER.md](./DOSSIER.md) for full details.
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✓ Created/Updated README.md for ${firm.name}`);
}

console.log('Creating/updating dossiers for enriched firms...\n');

enrichedFirms.forEach(firm => {
  createDossier(firm);
  console.log('');
});

console.log('=== DOSSIER UPDATE COMPLETE ===');
console.log(`Updated/created ${enrichedFirms.length} firm dossiers`);
