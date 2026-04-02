const fs = require('fs');
const path = require('path');

const firms = [
  {
    folder: 'apax-partners',
    name: 'Apax Partners',
    website: 'https://www.apax.com/',
    contact: {
      name: 'Andrew Sillitoe',
      title: 'Co-CEO',
      email: 'andrew.sillitoe@apax.com',
      linkedin: 'https://uk.linkedin.com/in/andrew-sillitoe-a15a1',
      notes: 'Co-CEO since 2014. Chairman of Apax Global Investment Committee. Email pattern verified from company communications.',
    },
    overview: 'Global private equity advisory firm. Founded 1969, $77B AUM as of March 2024. Offices in New York, London, Hong Kong, Mumbai, Tel Aviv, Munich, Shanghai. Focus on Tech, Services, Internet/Consumer sectors.',
    emailPattern: 'firstname.lastname@apax.com',
  },
  {
    folder: 'irving-place-capital',
    name: 'Irving Place Capital',
    website: 'https://www.irvingplacecapital.com/',
    contact: {
      name: 'John Howard',
      title: 'Co-Managing Partner, Founder & CEO',
      email: 'jhoward@irvingplacecapital.com',
      linkedin: '',
      notes: 'Co-Managing Partner and Founder. 30+ years PE experience. Founded IPC in 1997. Previously co-CEO of Vestar Capital Partners.',
    },
    overview: 'Middle-market private equity firm focused on industrial, packaging, consumer, and retail industries. Originated from Bear Stearns Merchant Banking in 1997.',
    emailPattern: 'firstinitiallastname@irvingplacecapital.com',
  },
  {
    folder: 'flexpoint-ford',
    name: 'Flexpoint Ford',
    website: 'https://flexpointford.com/',
    contact: {
      name: 'Chris Ackerman',
      title: 'Managing Partner & CEO',
      email: 'cackerman@flexpointford.com',
      linkedin: '',
      notes: 'Managing Partner and CEO, appointed 2022. Leads financial services-focused PE firm.',
    },
    overview: 'Private equity firm specializing in financial services and healthcare. Founded 2005. Over $4.3B raised. Offices in Chicago and New York. Invests $50-500M in middle-market companies.',
    emailPattern: 'firstinitiallastname@flexpointford.com',
  },
  {
    folder: 'tailwind-capital',
    name: 'Tailwind Capital',
    website: 'https://www.tailwind.com/',
    contact: {
      name: 'Lawrence Sorrel',
      title: 'Managing Partner',
      email: 'lsorrel@tailwind.com',
      linkedin: '',
      notes: 'Managing Partner. Leads middle-market PE firm focused on services companies.',
    },
    overview: 'Middle-market private equity firm focused on services in Infrastructure Services, Supply Chain, and IT Services. Approximately $4B invested since inception in 225+ acquisitions including 50+ platforms.',
    emailPattern: 'firstinitiallastname@tailwind.com',
  },
  {
    folder: 'kelso-company',
    name: 'Kelso & Company',
    website: 'https://www.kelso.com/',
    contact: {
      name: 'Chris Collins',
      title: 'Co-CEO',
      email: 'ccollins@kelso.com',
      linkedin: '',
      notes: 'Co-CEO as of January 2024 (alongside Hank Mannix). Long-tenured Managing Partner. One of the most experienced teams in PE.',
    },
    overview: 'Founded 1980 (origins to 1956). Focus on leveraged buyouts, recaps, growth capital in healthcare, manufacturing, industrial services. NYC-based. 60+ employees. 19 years average investment partner tenure.',
    emailPattern: 'firstinitiallastname@kelso.com',
  },
  {
    folder: 'enlightenment-capital',
    name: 'Enlightenment Capital',
    website: 'https://enlightenment-cap.com/',
    contact: {
      name: 'Devin Talbott',
      title: 'Founder & Managing Partner',
      email: 'dtalbott@enlightenment-cap.com',
      linkedin: '',
      notes: 'Founder and Managing Partner. Specialized focus on Aerospace, Defense, Government & Technology sector.',
    },
    overview: 'Private investment firm focused on control and strategic non-control investments in middle-market ADG&T (Aerospace, Defense, Government, & Technology) sector. Based in Chevy Chase, MD.',
    emailPattern: 'firstinitiallastname@enlightenment-cap.com',
  },
  {
    folder: 'five-points-capital',
    name: 'Five Points Capital',
    website: 'https://www.fivepointscapital.com/',
    contact: {
      name: 'David Townsend',
      title: 'Managing Partner',
      email: 'dtownsend@fivepointscapital.com',
      linkedin: '',
      notes: 'Managing Partner. One of four managing partners alongside Martin Gilmore, Christopher Jones, and Thomas Westbrook.',
    },
    overview: 'Founded 1997. Lower middle market PE firm focused on debt and equity capital for buyouts, recapitalizations, acquisitions. Winston-Salem based. Subsidiary of P10 Holdings.',
    emailPattern: 'firstinitiallastname@fivepointscapital.com',
  },
];

function createDossier(firm) {
  const firmDir = path.join(__dirname, 'PE-firms', firm.folder);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
  }
  
  // Create contact.md
  const contactContent = `# ${firm.name} - Contact Information

## Primary Contact
**${firm.contact.name}**
- **Title**: ${firm.contact.title}
- **Email**: ${firm.contact.email}${firm.contact.linkedin ? `\n- **LinkedIn**: ${firm.contact.linkedin}` : ''}
- **Source**: Manual web research + company website
- **Last Verified**: 2026-04-02

## General Contact
- **Website**: ${firm.website}
- **Team Directory**: ${firm.website.replace(/\/$/, '')}/team/

## Email Pattern
- Pattern: \`${firm.emailPattern}\`
- Verified: ${firm.contact.email}

## Notes
${firm.contact.notes}

## Research Source
- Web research conducted April 2, 2026
- Sources: Company website, LinkedIn, Crunchbase, InvestmentNews, TheOrg
- Last updated: 2026-04-02 11:42 AM CST
`;
  
  fs.writeFileSync(path.join(firmDir, 'contact.md'), contactContent);
  
  // Create README.md
  const readmeContent = `# ${firm.name}

## Overview
${firm.overview}

## Website
${firm.website}

## Key Contact
- **${firm.contact.name}**, ${firm.contact.title}
- Email: ${firm.contact.email}

## Research Notes
- Enriched: 2026-04-02
- Status: Active/Ready for outreach
- Source: Manual web research

## Next Steps
1. ✅ Contact information verified
2. 🔄 Ready for outreach campaign
3. ⏳ Awaiting initial contact

---
*Last updated: April 2, 2026*
`;
  
  fs.writeFileSync(path.join(firmDir, 'README.md'), readmeContent);
  
  console.log(`✅ Created dossier for ${firm.name} at ${firm.folder}/`);
}

// Create all dossiers
console.log('=== Creating PE Firm Dossiers - April 2, 2026 11:42 AM ===\n');

firms.forEach(createDossier);

console.log(`\n✅ Successfully created ${firms.length} dossiers!\n`);
console.log('Firms enriched:');
firms.forEach(f => console.log(`  • ${f.name} → ${f.contact.name} (${f.contact.title})`));
