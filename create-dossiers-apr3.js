const fs = require('fs');
const path = require('path');

const enrichedFirms = [
  {
    name: 'Svoboda Capital Partners',
    slug: 'svoboda-capital',
    contact: 'Tom Brooker',
    title: 'Managing Director & Operating Partner',
    website: 'https://svoco.com',
    focus: 'Lower middle-market, business services',
    notes: 'No email published on official site',
    source: 'svoco.com/our-team'
  },
  {
    name: 'Align Capital Partners',
    slug: 'align-capital-partners',
    contact: 'Chris Jones',
    title: 'Co-Founder & Managing Partner',
    website: 'https://aligncp.com',
    location: 'Cleveland & Dallas',
    focus: 'Lower middle-market, business services',
    notes: 'Alt contact: Rob Langley (Co-Founder/MP). Over 55 PE transactions, $3B+ value. Ex-Riverside Company partner.',
    source: 'aligncp.com/team'
  },
  {
    name: 'CORE Industrial Partners',
    slug: 'core-industrial-partners',
    contact: 'John May',
    title: 'Founder & Managing Partner',
    website: 'https://coreipfund.com',
    aum: '$1.58B',
    focus: 'Industrials-focused PE',
    notes: 'Founder. Previously worked with Blackstone & H.I.G. Capital. Oversees all firm activities.',
    source: 'coreipfund.com/teammember/john-may'
  },
  {
    name: 'Pritzker Private Capital',
    slug: 'pritzker-private-capital',
    contact: 'Tony Pritzker',
    title: 'Chairman & CEO',
    website: 'https://www.ppcpartners.com',
    focus: 'Mid-market, manufactured products & business services',
    notes: '20+ years as active investor and board member. Operating experience: Chairman AmSafe Partners, President Baker Tanks, Group Executive at Marmon Group.',
    source: 'ppcpartners.com/team'
  },
  {
    name: 'Tailwind Capital',
    slug: 'tailwind-capital',
    contact: 'Lawrence B. Sorrel',
    title: 'Co-Founder, Managing Partner & CEO',
    website: 'https://tailwind.com',
    notes: 'No email published on official site',
    source: 'tailwind.com/team'
  },
  {
    name: 'Silver Oak Services Partners',
    slug: 'silver-oak-services-partners',
    contact: 'Daniel M. Gill',
    title: 'Managing Partner',
    website: 'https://www.silveroaksp.com',
    location: 'Evanston, Illinois',
    focus: 'Lower middle-market, services businesses',
    notes: 'Alt contacts: Gregory M. Barr & Wade D. Glisson (Managing Partners). 26+ years avg PE experience in services sector.',
    source: 'silveroaksp.com/team'
  },
  {
    name: 'Resilience Capital Partners',
    slug: 'resilience-capital-partners',
    contact: 'Steven H. Rosen',
    title: 'Co-Founder',
    website: 'https://resiliencecapital.com',
    location: 'Cleveland, Ohio',
    founded: '2001',
    focus: 'Manufacturing & business services, Eastern & Midwestern US',
    notes: 'Alt contact: Bassem A. Mansour (Co-Founder). Companies $25M-$250M.',
    source: 'Wikipedia & resiliencecapital.com'
  },
  {
    name: 'Mako Capital Group',
    slug: 'mako-capital-group',
    contact: 'Angel Morales',
    title: 'Founding Partner',
    website: 'https://makocapitalgroup.com',
    location: 'Miami',
    founded: 'March 2026',
    focus: 'Lower middle-market, financial/healthcare/essential services',
    notes: 'Just launched. Team has managed $6B+ in PE assets with 30+ years experience. Capital-light, recession-resistant models.',
    source: 'makocapitalgroup.com'
  },
  {
    name: 'Trivest Partners',
    slug: 'trivest-partners',
    email: 'info@trivest.com',
    website: 'https://www.trivest.com',
    location: 'Miami (+ Charlotte, Chicago, LA, Philadelphia, Toronto)',
    founded: '1981',
    focus: 'Founder-friendly PE investor',
    notes: 'General firm email from PDF factsheet. Multi-office presence.',
    source: 'trivest.com PDF factsheet'
  },
  {
    name: 'Huron Capital Partners',
    slug: 'huron-capital-partners',
    contact: 'Jim Mahoney',
    title: 'Managing Partner',
    website: 'https://www.huroncapital.com',
    location: 'Detroit',
    founded: '1999',
    aum: '$7B+ raised',
    focus: 'Lower middle-market, North American services businesses (infrastructure, facility, residential services)',
    notes: 'Celebrating 25 years. 290+ platform & add-on acquisitions. ExecFactor program: thematic buy-and-build strategy.',
    source: 'huroncapital.com/people'
  },
  {
    name: 'Kinderhook Industries',
    slug: 'kinderhook-industries',
    contact: 'Christian Michalik',
    title: 'Managing Director',
    website: 'https://www.kinderhook.com',
    location: 'New York City',
    founded: '2003',
    aum: '$10B+ committed capital',
    focus: 'Healthcare services, environmental & industrial services, light manufacturing, automotive',
    notes: 'Alt contacts: Robert Michalik (MD), Thomas Tuttle (Chairman). 500+ investments. Jan 2026: closed $1B Ecowaste Solutions deal with Goldman Sachs & Apollo.',
    source: 'kinderhook.com/team'
  },
  {
    name: 'Bow River Capital',
    slug: 'bow-river-capital',
    contact: 'Blair E. Richardson',
    title: 'Founder & CEO',
    linkedin: 'https://www.linkedin.com/in/blair-richardson-a4755613/',
    website: 'https://www.bowrivercapital.com',
    location: 'Denver, Colorado',
    founded: '2003',
    aum: '~$2.5B',
    focus: 'Mid-market, healthcare services, industrial services, business services',
    notes: 'Alt contact: Eric B. Wolf (Co-Founder). Board member at National Jewish Health.',
    source: 'Crunchbase + bowrivercapital.com'
  }
];

const DOSSIER_DIR = 'PE-firms';

function createDossier(firm) {
  const dirPath = path.join(DOSSIER_DIR, firm.slug);
  const filePath = path.join(dirPath, 'dossier.md');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const content = `# ${firm.name}

## Overview
- **Website:** ${firm.website}
${firm.location ? `- **Location:** ${firm.location}` : ''}
${firm.founded ? `- **Founded:** ${firm.founded}` : ''}
${firm.aum ? `- **AUM:** ${firm.aum}` : ''}
- **Focus:** ${firm.focus || 'Mid-market private equity'}

## Key Contact
${firm.contact ? `- **Name:** ${firm.contact}` : '- **Name:** (No individual contact found)'}
${firm.title ? `- **Title:** ${firm.title}` : ''}
${firm.email ? `- **Email:** ${firm.email}` : '- **Email:** (Not published on official sources)'}
${firm.linkedin ? `- **LinkedIn:** ${firm.linkedin}` : ''}

## Notes
${firm.notes}

## Source
${firm.source}

## Last Updated
${new Date().toISOString().split('T')[0]} - Enrichment via official website research
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Created/updated: ${filePath}`);
}

console.log('Creating dossiers for enriched PE firms...\n');
enrichedFirms.forEach(createDossier);
console.log(`\n✓ Completed ${enrichedFirms.length} dossiers.`);
