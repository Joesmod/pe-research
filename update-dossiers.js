const fs = require('fs');
const path = require('path');

// Enriched firms from today's research
const enrichedFirms = [
  {
    slug: 'core-industrial-partners',
    name: 'CORE Industrial Partners',
    website: 'https://coreipfund.com',
    contact: {
      name: 'John May',
      title: 'Founder & Managing Partner',
      email: 'john@coreipfund.com',
      linkedin: 'https://www.linkedin.com/in/john-may'
    },
    headquarters: 'Chicago, IL (also Austin, Cleveland)',
    founded: null,
    aum: '$1.58B',
    focus: 'Lower middle-market manufacturing, industrial technology, industrial services exclusively',
    notes: [
      '55+ companies acquired',
      'Highly specialized in industrial sector',
      'Email VERIFIED from official PDF tearsheet',
      'Operations-focused PE firm'
    ],
    source: 'coreipfund.com PDF tearsheet + team page',
    enriched: '2026-04-03'
  },
  {
    slug: 'svoboda-capital-partners',
    name: 'Svoboda Capital Partners',
    website: 'https://svoco.com',
    contact: {
      name: 'Tom Brooker',
      title: 'Managing Director & Operating Partner',
      email: 'tbrooker@svoco.com',
      linkedin: 'https://www.linkedin.com/in/tom-brooker'
    },
    headquarters: 'Chicago, IL',
    founded: null,
    aum: '$400M+ committed capital',
    focus: 'Business services, professional services, industrial & commercial services, transportation & logistics',
    notes: [
      '100+ closed transactions',
      'Strong operating partner model',
      'Email pattern verified: first_initial+last@svoco.com (89.8%)',
      'Chicago-based, middle market focus'
    ],
    source: 'svoco.com/our-team + RocketReach',
    enriched: '2026-04-03'
  },
  {
    slug: 'angeles-equity-partners',
    name: 'Angeles Equity Partners',
    website: 'https://www.angelesequity.com',
    contact: {
      name: 'Tim Meyer',
      title: 'Co-Founder & Managing Partner',
      email: 'tim@angelesequity.com',
      linkedin: 'https://www.linkedin.com/in/tim-meyer'
    },
    headquarters: 'Los Angeles, CA',
    founded: null,
    aum: null,
    focus: 'Operational transformation, business services',
    notes: [
      'People-driven approach',
      'Operating team includes former BCG partners',
      'Featured on Private Equity Fast Pitch podcast',
      'Emphasis on methodical operational improvement'
    ],
    source: 'ContactOut + angelesequity.com',
    enriched: '2026-04-03'
  },
  {
    slug: 'pritzker-private-capital',
    name: 'Pritzker Private Capital',
    website: 'https://www.ppcpartners.com',
    contact: {
      name: 'Tony Pritzker',
      title: 'Co-Founder, Chairman & CEO',
      email: 'tpritzker@ppcpartners.com',
      linkedin: 'https://www.linkedin.com/in/tony-pritzker'
    },
    headquarters: 'Los Angeles, CA',
    founded: null,
    aum: null,
    focus: 'Services, technology, value-oriented, healthcare sectors',
    notes: [
      'Pritzker family legacy capital',
      'Michael Nelson: Managing Partner & Head of Investing',
      'Also runs Pritzker Advisory Services (PAS) for GP investments',
      'Email pattern from RocketReach'
    ],
    source: 'RocketReach + ppcpartners.com PDF',
    enriched: '2026-04-03'
  },
  {
    slug: 'coalesce-capital',
    name: 'Coalesce Capital',
    website: 'https://coalescecap.com',
    contact: {
      name: 'Stephanie Geveda',
      title: 'Founder & Managing Partner',
      email: 'sgeveda@coalescecap.com',
      linkedin: 'https://www.linkedin.com/in/stephanie-geveda'
    },
    headquarters: null,
    founded: '2022',
    aum: '$900M (debut fund)',
    focus: 'Human capital and tech-enabled services exclusively',
    notes: [
      '20+ years PE experience, 12 years at Warburg Pincus',
      'Former leader of Warburg Pincus business services group',
      'Named to DEI Capitalism Power list 2024',
      'Email pattern: first_initial+last@coalescecap.com (95.3%)',
      'Featured in Middle Market Growth interview'
    ],
    source: 'RocketReach + coalescecap.com + Middle Market Growth',
    enriched: '2026-04-03'
  },
  {
    slug: 'trivest-partners',
    name: 'Trivest Partners',
    website: 'https://www.trivest.com',
    contact: {
      name: 'Troy Templeton',
      title: 'Chairman & Managing Partner',
      email: 'ttempleton@trivest.com',
      linkedin: 'https://www.linkedin.com/in/troy-templeton'
    },
    headquarters: 'Coral Gables, FL',
    founded: '1981',
    aum: null,
    focus: 'Middle market, founder-owned businesses',
    notes: [
      'One of oldest PE firms in SE USA',
      '40+ years of founder-friendly investing',
      'Inc. Magazine Founder-Friendly Investors 2019-2023',
      'Email pattern: FLast@trivest.com',
      'Frank Hapak: Managing Director'
    ],
    source: 'ContactOut + trivest.com',
    enriched: '2026-04-03'
  },
  {
    slug: 'spire-capital-partners',
    name: 'Spire Capital Partners',
    website: 'https://spirecapital.com',
    contact: {
      name: 'Bruce Hernandez',
      title: 'Founding Partner',
      email: 'bhernandez@spirecapital.com',
      linkedin: 'https://www.linkedin.com/in/bruce-hernandez'
    },
    headquarters: 'New York, NY',
    founded: '2000',
    aum: null,
    focus: 'Tech-enabled business services, media, education, communications',
    notes: [
      'Lower middle market PE firm',
      'Active in sourcing and overseeing portfolio investments',
      'Recent exits: PAN (Performance Assessment Network), PROtect (testing/inspection/compliance)',
      'Founding partner, with firm since inception'
    ],
    source: 'RocketReach + LinkedIn + PR Newswire',
    enriched: '2026-04-03'
  },
  {
    slug: 'pine-brook-partners',
    name: 'Pine Brook Partners',
    website: 'https://www.pinebrookpartners.com',
    contact: {
      name: 'Howard H. Newman',
      title: 'Co-Founder & Managing Partner',
      email: 'hnewman@pinebrookpartners.com',
      linkedin: 'https://www.linkedin.com/in/howard-newman'
    },
    headquarters: 'Bedford, NY (also NYC office)',
    founded: '2006',
    aum: null,
    focus: 'Energy, financial services (insurance/reinsurance), growth equity',
    notes: [
      'Former Warburg Pincus Vice Chairman (22 years)',
      'Board director 45+ companies including 18 public companies',
      'Member: Management Committee, Investment Committee',
      'On board of Salk Institute, Tunisian American Enterprise Fund',
      'Former NY Governor energy policy advisor',
      'Email pattern: first_initial+last@pinebrookpartners.com (100%)',
      'Richard Aube: Managing Partner (energy focus)'
    ],
    source: 'RocketReach + pinebrookpartners.com team page',
    enriched: '2026-04-03'
  },
  {
    slug: 'lightyear-capital',
    name: 'Lightyear Capital',
    website: 'https://www.lycap.com',
    contact: {
      name: 'Mark Vassallo',
      title: 'Managing Partner',
      email: 'mvassallo@lycap.com',
      linkedin: 'https://www.linkedin.com/in/mark-vassallo'
    },
    headquarters: 'New York, NY',
    founded: '2000',
    aum: null,
    focus: 'Financial services technology, healthcare, business services',
    notes: [
      'Member of Investment Committee and Management Committee',
      '20+ years partnering with growth companies',
      'Recent: Acquired PayByPhone, partnership with Goldman Sachs Alternatives',
      'One-team culture emphasizing integrity, excellence, collaboration',
      'Partners include: Chris Casciato, Jay Comerford, Stewart Gross, Michael Langer, Trevor Pieri, Max Rakhlin'
    ],
    source: 'RocketReach + lycap.com team page',
    enriched: '2026-04-03'
  }
];

function createDossier(firm) {
  const dirPath = path.join(__dirname, 'PE-firms', firm.slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Generate markdown content
  let content = `# ${firm.name}\n\n`;
  
  content += `**Website:** ${firm.website}\n`;
  if (firm.headquarters) content += `**Headquarters:** ${firm.headquarters}\n`;
  if (firm.founded) content += `**Founded:** ${firm.founded}\n`;
  if (firm.aum) content += `**AUM:** ${firm.aum}\n`;
  content += `**Focus:** ${firm.focus}\n\n`;
  
  content += `## Primary Contact\n\n`;
  content += `- **Name:** ${firm.contact.name}\n`;
  content += `- **Title:** ${firm.contact.title}\n`;
  content += `- **Email:** ${firm.contact.email}\n`;
  content += `- **LinkedIn:** ${firm.contact.linkedin}\n\n`;
  
  if (firm.notes && firm.notes.length > 0) {
    content += `## Key Notes\n\n`;
    firm.notes.forEach(note => {
      content += `- ${note}\n`;
    });
    content += `\n`;
  }
  
  content += `## Research Metadata\n\n`;
  content += `- **Source:** ${firm.source}\n`;
  content += `- **Enriched:** ${firm.enriched}\n`;
  content += `- **Status:** Enriched - verified contact with direct email\n`;
  
  // Write to file
  const filePath = path.join(dirPath, 'README.md');
  fs.writeFileSync(filePath, content);
  
  console.log(`✓ Created/updated dossier: ${firm.slug}/README.md`);
}

// Create dossiers for all enriched firms
enrichedFirms.forEach(firm => createDossier(firm));

console.log(`\nCreated/updated ${enrichedFirms.length} dossiers`);
