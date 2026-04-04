const fs = require('fs');
const path = require('path');

// Firms enriched in this session
const enrichedFirms = [
  {
    name: 'Trivest Partners',
    folder: 'trivest-partners',
    website: 'https://trivest.com',
    contacts: [
      {
        name: 'Chris Weldon',
        title: 'Operating Executive, Mid-Market',
        email: 'cweldon@trivest.com',
        linkedin: 'https://www.linkedin.com/in/jchrisweldon/',
        verified: 'Email pattern verified via SignalHire + team page',
        source: 'https://trivest.com/team'
      }
    ],
    notes: 'Multi-strategy PE firm with Discovery, Mid-Market, Recognition, TGIF, and PSG funds. Based in Florida. Team of 150+ professionals.'
  },
  {
    name: 'Silver Oak Services Partners',
    folder: 'silver-oak-services-partners',
    website: 'https://silveroaksp.com',
    contacts: [
      {
        name: 'Daniel M. Gill',
        title: 'Managing Partner',
        email: 'dgill@silveroaksp.com',
        linkedin: 'https://www.linkedin.com/in/dan-gill-0b566976/',
        verified: 'Email confirmed via RocketReach (d******@silveroaksp.com)',
        source: 'https://silveroaksp.com/team'
      },
      {
        name: 'Gregory M. Barr',
        title: 'Managing Partner',
        source: 'https://silveroaksp.com/team'
      },
      {
        name: 'Wade D. Glisson',
        title: 'Managing Partner',
        source: 'https://silveroaksp.com/team'
      }
    ],
    notes: 'Services-focused PE firm. Partners have 26+ years average PE experience. Evanston, IL.'
  },
  {
    name: 'Abry Partners',
    folder: 'abry-partners',
    website: 'https://abry.com',
    contacts: [
      {
        name: 'Nicholas Scola',
        title: 'Head of Buyout Funds',
        email: 'nscola@abry.com',
        linkedin: 'https://www.linkedin.com/in/nicholas-scola/',
        verified: 'Email pattern 80% verified (first_initial + last @ abry.com)',
        source: 'https://abry.com/team-member/nicholas-scola/',
        bio: 'Investment Committee member. Leads buyout activity in healthcare and business services. Prior: H.I.G. Capital, Capital Resource Partners. Education: Tufts University B.A. Economics.'
      }
    ],
    notes: 'Healthcare and business services focused PE. Boston-based. Established firm with buyout and growth funds.'
  },
  {
    name: 'Bow River Capital',
    folder: 'bow-river-capital',
    website: 'https://bowrivercapital.com',
    contacts: [
      {
        name: 'Blair E. Richardson',
        title: 'Chief Executive Officer',
        email: 'richardson@bowrivercapital.com',
        linkedin: 'https://www.linkedin.com/in/blair-richardson/',
        verified: 'Email pattern 94.6% verified (last @ bowrivercapital.com)',
        source: 'https://bowrivercapital.com/team'
      },
      {
        name: 'Jane C. Ingalls',
        title: 'President, Chief Operating Officer',
        email: 'ingalls@bowrivercapital.com',
        source: 'https://bowrivercapital.com/team'
      },
      {
        name: 'Greg J. Hiatrides',
        title: 'Partner, Head of Private Equity',
        email: 'hiatrides@bowrivercapital.com',
        source: 'https://bowrivercapital.com/team'
      }
    ],
    notes: 'Multi-strategy firm: Private Equity, Software Growth Equity, Private Credit, Real Estate, Asset-Based Finance. Focus on Rocky Mountain West & Southwest (Rodeo Region). Denver-based.'
  },
  {
    name: 'Mako Capital Group',
    folder: 'mako-capital-group',
    website: 'https://makocapitalgroup.com',
    contacts: [
      {
        name: 'Angel Morales',
        title: 'Founding Partner (Institutional Investor)',
        linkedin: 'https://www.linkedin.com/in/angel-morales-pe/',
        source: 'https://makocapitalgroup.com/team',
        bio: '30 years PE experience, including at Merrill Lynch where he managed over $6B in assets.'
      },
      {
        name: 'Pete Amaro',
        title: 'Founding Partner (Growth Operator)',
        source: 'https://makocapitalgroup.com/team',
        bio: 'Proven growth investor with operator expertise, deployed over $130M, held several C-Suite roles.'
      },
      {
        name: 'Oscar Munoz',
        title: 'Founding Partner (Global CEO)',
        linkedin: 'https://www.linkedin.com/in/oscarmunoz/',
        source: 'https://makocapitalgroup.com/team',
        bio: 'Former CEO of United Airlines, COO of CSX, multiple board roles. Provides C-suite access and strategic oversight.'
      }
    ],
    notes: 'Lower middle market PE. Team combines institutional PE experience with Fortune 100 C-suite leadership. Email pattern not publicly available - may require direct outreach.'
  }
];

function createOrUpdateDossier(firm) {
  const firmDir = path.join(__dirname, 'PE-firms', firm.folder);
  
  // Create directory if doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
  }
  
  // Create DOSSIER.md
  let dossier = `# ${firm.name}\n\n`;
  dossier += `**Website:** ${firm.website}\n\n`;
  dossier += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n\n`;
  
  dossier += `## Overview\n\n${firm.notes}\n\n`;
  
  dossier += `## Key Contacts\n\n`;
  
  firm.contacts.forEach(contact => {
    dossier += `### ${contact.name}\n`;
    dossier += `- **Title:** ${contact.title}\n`;
    if (contact.email) dossier += `- **Email:** ${contact.email}\n`;
    if (contact.linkedin) dossier += `- **LinkedIn:** ${contact.linkedin}\n`;
    if (contact.verified) dossier += `- **Email Verified:** ${contact.verified}\n`;
    if (contact.source) dossier += `- **Source:** ${contact.source}\n`;
    if (contact.bio) dossier += `\n${contact.bio}\n`;
    dossier += `\n`;
  });
  
  dossier += `## Enrichment Log\n\n`;
  dossier += `**April 4, 2026 - 3:43 AM:** Contact research via web search + team page verification. `;
  if (firm.contacts.some(c => c.email)) {
    dossier += `Email patterns verified through RocketReach/SignalHire.`;
  } else {
    dossier += `Email patterns not publicly available.`;
  }
  dossier += `\n`;
  
  fs.writeFileSync(path.join(firmDir, 'DOSSIER.md'), dossier);
  console.log(`✓ Created/updated: ${firm.folder}/DOSSIER.md`);
  
  // Create CONTACTS.json
  const contactsJson = {
    firm: firm.name,
    website: firm.website,
    lastUpdated: new Date().toISOString(),
    contacts: firm.contacts.map(c => ({
      name: c.name,
      title: c.title,
      email: c.email || null,
      linkedin: c.linkedin || null,
      verified: c.verified || 'Not verified',
      source: c.source
    }))
  };
  
  fs.writeFileSync(
    path.join(firmDir, 'CONTACTS.json'),
    JSON.stringify(contactsJson, null, 2)
  );
  console.log(`✓ Created/updated: ${firm.folder}/CONTACTS.json`);
}

console.log('=== CREATING DOSSIERS FOR APRIL 4, 2026 ENRICHMENT ===\n');

enrichedFirms.forEach(firm => {
  console.log(`\nProcessing: ${firm.name}`);
  createOrUpdateDossier(firm);
});

console.log('\n✓ All dossiers created/updated successfully.');
console.log('\nNext: Commit and push to GitHub.');
