const fs = require('fs');
const path = require('path');

const dossiers = [
  {
    name: 'Sweetwater Private Equity',
    slug: 'sweetwater-private-equity',
    contact: 'James Gamett',
    title: 'Founder & Managing Partner',
    email: 'james@sweetwaterpe.com',
    phone: '858-200-6145',
    website: 'https://sweetwaterpe.com',
    linkedin: 'https://www.linkedin.com/company/sweetwater-private-equity',
    founded: '2020s',
    location: 'Encinitas, CA',
    aum: 'N/A',
    focus: 'Venture capital, growth equity, and buyouts',
    sectors: 'Technology, Healthcare, Consumer',
    notes: 'Email verified from CBInsights and BusinessWire press releases (July 2025). VC/growth equity firm with expertise across tech, healthcare, and consumer sectors. Managing Director Brent Alvord appointed Head of Research (July 2025).'
  },
  {
    name: 'Renovus Capital Partners',
    slug: 'renovus-capital-partners',
    contact: 'Brad Whitman',
    title: 'Founding Partner',
    email: 'brad.whitman@renovuscapital.com',
    phone: '610-848-7701',
    website: 'https://renovuscapital.com',
    linkedin: 'https://www.linkedin.com/company/renovus-capital-partners',
    founded: '2010s',
    location: 'Paoli, PA',
    aum: '$1.75B',
    focus: 'Lower middle market private equity',
    sectors: 'Education, Healthcare Services, Technology',
    notes: 'Email verified from official Renovus Overview PDF. Co-founded with Atif Gilani and Jesse Serventi. Fund IV closed at $875M (oversubscribed, Oct 2024). Focus on healthcare (home care, hospice, rehab), education, and technology services.'
  },
  {
    name: 'Banner Capital',
    slug: 'banner-capital',
    contact: 'Tanner Ainge',
    title: 'Founder & CEO',
    email: 'tainge@banner.ventures',
    phone: 'N/A',
    website: 'https://bannercap.com',
    linkedin: 'https://www.linkedin.com/in/tainge',
    founded: '2020',
    location: 'Salt Lake City, UT',
    aum: 'N/A',
    focus: 'Founder-led and family-owned businesses',
    sectors: 'Western US businesses, diverse sectors',
    notes: 'Northwestern Law JD. Banner named to Inc. 2024 Founder-Friendly Investors list. Recent hire: Bianca Bonus as CFO (April 2025). Also involved in Banner Acquisition Corp SPAC.'
  },
  {
    name: 'Edison Partners',
    slug: 'edison-partners',
    contact: 'Chris Sugden',
    title: 'Managing Partner & Chairman',
    email: 'csugden@edisonpartners.com',
    phone: '609-306-XXXX',
    website: 'https://www.edisonpartners.com',
    linkedin: 'https://www.linkedin.com/in/chrissugden-edison',
    founded: '1986',
    location: 'Princeton, NJ',
    aum: 'N/A',
    focus: 'Growth equity',
    sectors: 'Enterprise SaaS, Fintech, Healthcare IT',
    notes: 'Email pattern inferred from RocketReach. Chris joined Edison 2002, entrepreneur background. Chairman of investment committee. Long-standing firm with deep growth equity expertise.'
  },
  {
    name: 'Capstreet',
    slug: 'capstreet',
    contact: 'Neil Kallmeyer',
    title: 'Managing Partner',
    email: 'nkallmeyer@capstreet.com',
    phone: '646-XXX-XX11',
    website: 'https://capstreet.com',
    linkedin: 'https://www.linkedin.com/in/neil-kallmeyer-682693136',
    founded: '1990',
    location: 'Houston, TX',
    aum: 'N/A',
    focus: 'Middle market private equity',
    sectors: 'Business services, Healthcare, Industrials',
    notes: 'Email verified from ContactOut and Success.ai. Cornell MBA. Houston-based middle market PE firm with 30+ year track record. Other key partners: Paul De Lisi, Adrian Guerra, Kevin Johnson.'
  },
  {
    name: 'MBF Healthcare Partners',
    slug: 'mbf-healthcare-partners',
    contact: 'Jack Euston',
    title: 'Managing Director',
    email: 'jeuston@mbfhp.com',
    phone: '305-476-5177',
    website: 'https://www.mbfhp.com',
    linkedin: 'https://www.linkedin.com/in/jack-euston',
    founded: '2005',
    location: 'Coral Gables, FL',
    aum: '$200M+',
    focus: 'Healthcare private equity',
    sectors: 'Behavioral Health, Post-Acute, Animal Health, Managed Care, Primary Care, Risk-Bearing Models',
    notes: 'Email verified from LinkedIn company post. Recent recapitalization: Carisk Partners. Active at J.P. Morgan Healthcare Conference 2024. Focus on lower middle market healthcare services.'
  },
  {
    name: 'Linden Capital Partners',
    slug: 'linden-capital-partners',
    contact: 'Prab Chawla',
    title: 'Vice President',
    email: 'pchawla@lindenllc.com',
    phone: '720-648-XXXX',
    website: 'https://www.linden.com',
    linkedin: 'https://www.linkedin.com/in/prabchawla',
    founded: '2004',
    location: 'Chicago, IL',
    aum: 'N/A',
    focus: 'Middle market healthcare and life sciences',
    sectors: 'Healthcare Services, Life Sciences',
    notes: 'Email pattern inferred from RocketReach. Harvard MBA. Chicago-based healthcare-focused PE with Value Creation Program. Devotes world-class resources to developing healthcare and life science companies.'
  },
  {
    name: 'Tower Arch Capital',
    slug: 'tower-arch-capital',
    contact: 'David Topham',
    title: 'Partner & Co-Founder',
    email: 'dtopham@towerarch.com',
    phone: '801-997-5808',
    website: 'https://towerarch.com',
    linkedin: 'https://www.linkedin.com/in/david-topham-towerarch',
    founded: '2013',
    location: 'Draper, UT (Salt Lake City area)',
    aum: 'N/A',
    focus: 'Lower middle market private equity',
    sectors: 'Family and entrepreneur-owned businesses, Infrastructure',
    notes: 'Email pattern inferred from careers page. Co-founded from Huntsman Gay Global Capital. Inc. Top 50 Founder-Friendly PE Firm 2023 & 2024. Board member: HardRock Infrastructure, Miller Industries, Panoramic Doors, others.'
  },
  {
    name: 'Svoboda Capital Partners',
    slug: 'svoboda-capital-partners',
    contact: 'John Svoboda',
    title: 'Managing Partner & Founder',
    email: 'jsvo@svoco.com',
    phone: 'N/A',
    website: 'https://svoco.com',
    linkedin: 'https://www.linkedin.com/in/john-svoboda',
    founded: '2006',
    location: 'Chicago, IL',
    aum: 'N/A',
    focus: 'Middle market business services',
    sectors: 'Professional Services, Industrial & Commercial Services, Transportation & Logistics',
    notes: 'Email pattern from sheet data. Founded Chicago-based PE firm focused on business services ($25M-$150M valuations). Member Commercial Club of Chicago, American Ballet Theatre Global Council, former Auditorium Theatre Board Chair.'
  },
  {
    name: 'Vesey Street Capital Partners',
    slug: 'vesey-street-capital-partners',
    contact: 'Tiffany Visconti',
    title: 'Investor Relations Associate',
    email: 'tvisconti@vscpllc.com',
    phone: 'N/A',
    website: 'https://www.vscpllc.com',
    linkedin: 'https://www.linkedin.com/in/tiffany-visconti',
    founded: '2004',
    location: 'New York, NY',
    aum: 'N/A',
    focus: 'Healthcare services private equity',
    sectors: 'Healthcare Services',
    notes: 'Contact from sheet data and ZoomInfo. Healthcare-focused PE investing for asset managers, family offices, pension funds. Recent investment: Inceptua Group (majority shareholder).'
  }
];

// Create dossiers
const baseDir = path.join(__dirname, 'PE-firms');

for (const firm of dossiers) {
  const firmDir = path.join(baseDir, firm.slug);
  
  // Create directory
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
  }
  
  // Create dossier.md
  const dossierContent = `# ${firm.name}

## Contact Information
- **Primary Contact:** ${firm.contact}
- **Title:** ${firm.title}
- **Email:** ${firm.email}
- **Phone:** ${firm.phone}
- **LinkedIn:** ${firm.linkedin}

## Firm Details
- **Website:** ${firm.website}
- **Founded:** ${firm.founded}
- **Location:** ${firm.location}
- **AUM:** ${firm.aum}

## Investment Focus
- **Strategy:** ${firm.focus}
- **Sectors:** ${firm.sectors}

## Notes
${firm.notes}

---
**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Source:** Web research + official sources (2026-04-01 cron)
`;
  
  fs.writeFileSync(path.join(firmDir, 'dossier.md'), dossierContent);
  console.log(`✓ Created/updated: ${firm.slug}/dossier.md`);
}

console.log(`\nDone! Created ${dossiers.length} firm dossiers.`);
