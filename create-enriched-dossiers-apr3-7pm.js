const fs = require('fs');
const path = require('path');

const enrichments = [
  {
    slug: 'excellere-partners',
    name: 'Excellere Partners',
    website: 'https://excellere.com',
    contact: 'Brad Cornell',
    title: 'Managing Partner',
    email: 'bcornell@excellere.com',
    linkedin: 'https://www.linkedin.com/in/brad-cornell-016325a3/',
    focus: 'Middle-market private equity focused on partnering with founder-led businesses',
    location: 'Denver, Colorado',
    notes: 'Email pattern verified via RocketReach. Managing Partner confirmed on excellere.com/team. Denver-based PE firm.'
  },
  {
    slug: 'platte-river-equity',
    name: 'Platte River Equity',
    website: 'https://platteriverequity.com',
    contact: 'Peter Calamari',
    title: 'Managing Director',
    email: 'pcalamari@platteriverequity.com',
    linkedin: 'https://platteriverequity.com/our-team/peter-w-calamari/',
    focus: 'Middle-market PE focused on Industrials sector',
    location: 'Denver, Colorado',
    notes: 'Email VERIFIED via ContactOut + RocketReach. Managing Director confirmed on platteriverequity.com. Joined 2008, focuses on Industrials.'
  },
  {
    slug: 'bow-river-capital',
    name: 'Bow River Capital',
    website: 'https://www.bowrivercapital.com',
    contact: 'Blair Richardson',
    title: 'Founder and Chief Executive Officer',
    email: 'richardson@bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/in/blair-richardson-a4755613/',
    focus: 'Private alternative asset management focused on lower middle market in private equity, real estate, and software',
    location: 'Denver, Colorado',
    aum: '~$2.5B+',
    sectors: 'Healthcare services, industrials, lower-middle-market software',
    founded: '2003',
    notes: 'Email verified via ContactOut. Co-Founder & CEO. Denver-based, ~$2.5B+ AUM. Focus: healthcare services, industrials, lower-middle-market software. Founded 2003.'
  },
  {
    slug: 'wind-point-partners',
    name: 'Wind Point Partners',
    website: 'https://www.wppartners.com',
    contact: 'Alex Washington',
    title: 'Managing Director',
    email: 'awashington@wppartners.com',
    linkedin: 'https://www.linkedin.com/in/alex-washington-38949217/',
    focus: 'Middle-market private equity focused on business and tech-enabled services, industrial growth, and healthcare',
    location: 'Chicago, Illinois',
    aum: '~$6B',
    sectors: 'Business and tech-enabled services, industrial growth, healthcare',
    founded: '1984',
    notes: 'Email pattern verified via RocketReach. Managing Director, joined 2002. Chicago-based, ~$6B AUM. Focus: middle-market, business/tech services.'
  }
];

function createDossier(data) {
  const dirPath = path.join(__dirname, 'PE-firms', data.slug);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const content = `# ${data.name}

## Overview
${data.focus}

**Location:** ${data.location}
${data.aum ? `**AUM:** ${data.aum}` : ''}
${data.founded ? `**Founded:** ${data.founded}` : ''}
${data.sectors ? `**Sectors:** ${data.sectors}` : ''}

**Website:** ${data.website}

## Primary Contact

**Name:** ${data.contact}  
**Title:** ${data.title}  
**Email:** ${data.email}  
**LinkedIn:** ${data.linkedin}

## Source & Notes

${data.notes}

**Research Date:** ${new Date().toISOString().split('T')[0]}  
**Source:** Automated enrichment via web research + Apollo API

## Next Steps

- Qualifying email intro
- Meeting request
- Tailor pitch to their focus areas${data.sectors ? ` (${data.sectors})` : ''}
`;

  const filePath = path.join(dirPath, 'README.md');
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`✅ Created: ${data.slug}/README.md`);
}

console.log('📝 Creating PE firm dossiers...\n');

enrichments.forEach(createDossier);

console.log(`\n✨ Created ${enrichments.length} dossiers in PE-firms/\n`);
