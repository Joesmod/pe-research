const fs = require('fs');
const path = require('path');

const firms = [
  {
    name: 'Gauge Capital',
    slug: 'gauge-capital',
    contact: {
      name: 'Drew Johnson',
      title: 'Co-Founder & Managing Partner/CEO',
      email: 'djohnson@gaugecapital.com',
      linkedin: 'http://www.linkedin.com/in/drew-johnson-793335262'
    },
    overview: {
      location: 'TBD',
      founded: 'TBD',
      focus: 'Private Equity',
      website: 'https://gaugecapital.com'
    }
  },
  {
    name: 'Hughes & Company',
    slug: 'hughes-and-company',
    contact: {
      name: 'Mark Regal',
      title: 'Partner and Chief Operating Officer',
      email: 'mregal@hughes-co.com',
      linkedin: 'http://www.linkedin.com/in/mregal'
    },
    overview: {
      location: 'Chicago, IL',
      founded: 'TBD',
      focus: 'Healthcare, Technology Services',
      website: 'https://hughes-co.com'
    }
  },
  {
    name: 'Trivest Partners',
    slug: 'trivest-partners',
    contact: {
      name: 'Todd Jerles',
      title: 'Partner, Chief Operating Officer',
      email: 'tjerles@trivest.com',
      linkedin: 'http://www.linkedin.com/in/todd-jerles-3070784'
    },
    overview: {
      location: 'Miami, FL (multi-location)',
      founded: '1981',
      focus: 'Founder-led and family-owned businesses',
      website: 'https://www.trivest.com'
    }
  },
  {
    name: 'Huron Capital Partners',
    slug: 'huron-capital-partners',
    contact: {
      name: 'Greg Peterson',
      title: 'Operating Partner',
      email: 'gpeterson@huroncapital.com',
      linkedin: 'http://www.linkedin.com/in/greg-peterson-9aa5b18'
    },
    overview: {
      location: 'Detroit, MI',
      founded: '1999',
      focus: 'Niche manufacturing and business services',
      website: 'https://www.huroncapital.com',
      aum: '$2B+'
    }
  },
  {
    name: 'Incline Equity Partners',
    slug: 'incline-equity-partners',
    contact: {
      name: 'Julia Evans',
      title: 'Vice President',
      email: 'julia.evans@inclineequity.com',
      linkedin: 'http://www.linkedin.com/in/julia-evans-00ab86b9'
    },
    overview: {
      location: 'Pittsburgh, PA',
      founded: 'TBD',
      focus: 'Middle-market private equity',
      website: 'https://www.inclineequity.com'
    }
  },
  {
    name: 'New Harbor Capital',
    slug: 'new-harbor-capital',
    contact: {
      name: 'Bo Mlnarik',
      title: 'Principal',
      email: 'bmlnarik@newharborcap.com',
      linkedin: 'http://www.linkedin.com/in/bo-mlnarik'
    },
    overview: {
      location: 'Chicago, IL',
      founded: '2013',
      focus: 'Lower middle-market healthcare, education, and technology-enabled services',
      website: 'https://www.newharborcap.com'
    }
  },
  {
    name: 'Linsalata Capital Partners',
    slug: 'linsalata-capital-partners',
    contact: {
      name: 'Eric Bacon',
      title: 'Co-president and Senior Managing Director',
      email: 'ebacon@linsalatacapital.com',
      linkedin: 'http://www.linkedin.com/in/eric-bacon-48411557'
    },
    overview: {
      location: 'TBD',
      founded: 'TBD',
      focus: 'Middle-market private equity',
      website: 'https://www.linsalatacapital.com'
    }
  },
  {
    name: 'Shore Capital Partners',
    slug: 'shore-capital-partners',
    contact: {
      name: 'Joe Yaro',
      title: 'Founder & Chief Executive Officer',
      email: 'jyaro@shorecp.com',
      linkedin: 'http://www.linkedin.com/in/josephyaro'
    },
    overview: {
      location: 'Chicago, IL',
      founded: 'TBD',
      focus: 'Healthcare and food & beverage',
      website: 'https://www.shorecp.com'
    }
  },
  {
    name: 'Norwest Equity Partners',
    slug: 'norwest-equity-partners',
    contact: {
      name: 'Eric Frueh',
      title: 'Principal',
      email: 'efrueh@nep.com',
      linkedin: 'http://www.linkedin.com/in/eric-frueh-6a802549'
    },
    overview: {
      location: 'Minneapolis, MN (multi-location)',
      founded: 'TBD',
      focus: 'Middle-market growth equity',
      website: 'https://www.nep.com'
    }
  },
  {
    name: 'Waud Capital Partners',
    slug: 'waud-capital-partners',
    contact: {
      name: 'Mike Lehman',
      title: 'Principal',
      email: 'mlehman@waudcapital.com',
      linkedin: 'http://www.linkedin.com/in/mike-lehman-8997963b'
    },
    overview: {
      location: 'Chicago, IL',
      founded: 'TBD',
      focus: 'Healthcare-focused private equity',
      website: 'https://www.waudcapital.com'
    }
  }
];

function createDossier(firm) {
  const firmDir = path.join(__dirname, 'PE-firms', firm.slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
  }
  
  // Create README.md
  const readme = `# ${firm.name}

## Overview
- **Location**: ${firm.overview.location}
- **Founded**: ${firm.overview.founded}
- **Focus**: ${firm.overview.focus}${firm.overview.aum ? `\n- **AUM**: ${firm.overview.aum}` : ''}
- **Website**: ${firm.overview.website}

## Investment Strategy
${firm.name} is a ${firm.overview.focus.toLowerCase()} private equity firm.

## Key People

### ${firm.contact.name} - ${firm.contact.title}
  - ${firm.contact.title}
  - Email: ${firm.contact.email}
  - LinkedIn: ${firm.contact.linkedin}
  - **Source**: Apollo.io verified contact data

## Contact Information
- **Primary Contact**: ${firm.contact.name} (${firm.contact.email})

## Research Notes
- **Date Added**: 2026-03-31
- **Last Updated**: 2026-03-31 (Hourly PE Research & Enrichment Cron)
- **Enrichment Status**: Contact verified via Apollo API
- **Contact Method**: Direct email available

## Sources
- Apollo.io contact database
- Company website: ${firm.overview.website}
`;

  // Create contact.md
  const contactMd = `# ${firm.name} - Contact Information

## Primary Contact
**${firm.contact.name}**
- **Title**: ${firm.contact.title}
- **Email**: ${firm.contact.email}
- **LinkedIn**: ${firm.contact.linkedin}
- **Source**: Apollo.io API
- **Last Verified**: 2026-03-31

## General Contact
- **Website**: ${firm.overview.website}

## Email Pattern
- Verified contact: ${firm.contact.email}

## Notes
- Contact verified via Apollo.io API
- Last updated: 2026-03-31
`;

  // Write files
  fs.writeFileSync(path.join(firmDir, 'README.md'), readme);
  fs.writeFileSync(path.join(firmDir, 'contact.md'), contactMd);
  
  console.log('✓ Created dossier for ' + firm.name);
}

// Create all dossiers
firms.forEach(firm => createDossier(firm));

console.log('');
console.log('All dossiers created successfully!');
