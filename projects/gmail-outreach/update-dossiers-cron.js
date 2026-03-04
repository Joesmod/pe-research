const fs = require('fs');
const path = require('path');

const DOSSIERS_DIR = '../../pe-research/PE-firms';

const enrichedLeads = [
  {
    company: 'Argonaut Private Equity',
    filename: 'argonaut-private-equity.md',
    contact: 'Anil Khatod',
    title: 'Sr. Partner & Managing Director',
    email: 'akhatod@kfoc.net',
    linkedin: ''
  },
  {
    company: 'Calvert Street Investment Partners',
    filename: 'calvert-street-investment-partners.md',
    contact: 'Reidan Cruz',
    title: 'Managing Director, Investor Relations',
    email: 'rcruz@calvertst.com',
    linkedin: ''
  },
  {
    company: 'Infinity Capital Partners',
    filename: 'infinity-capital-partners.md',
    contact: 'Chris Mehalko',
    title: 'Vice President, Business Development',
    email: 'cmehalko@infinityfunds.com',
    linkedin: ''
  },
  {
    company: 'Cambridge Capital LLC',
    filename: 'cambridge-capital-llc.md',
    contact: 'Stephen Edenbaum',
    title: 'Vice President, Business Development',
    email: 'stephen.edenbaum@cambridgehomes.com',
    linkedin: ''
  },
  {
    company: 'Palm Beach Capital',
    filename: 'palm-beach-capital.md',
    contact: 'Mike Schmickle',
    title: 'Partner',
    email: 'mschmickle@pbcap.com',
    linkedin: ''
  },
  {
    company: 'Stronghold Investment Management',
    filename: 'stronghold-investment-management.md',
    contact: 'Quin Cogdell',
    title: 'Managing Director',
    email: 'quin.cogdell@srp-ok.com',
    linkedin: ''
  },
  {
    company: 'Aurora Capital Partners',
    filename: 'aurora-capital-partners.md',
    contact: 'Matthew Laycock',
    title: 'Partner',
    email: 'mlaycock@auroracap.com',
    linkedin: ''
  },
  {
    company: 'Edgewater Capital Partners',
    filename: 'edgewater-capital-partners.md',
    contact: 'Tom Edson',
    title: 'President & CEO',
    email: 'tom@edgewaterfund.com',
    linkedin: ''
  },
  {
    company: 'Emerging Capital Partners',
    filename: 'emerging-capital-partners.md',
    contact: 'Carolyn Campbell',
    title: 'Managing Partner, CEO/COO and Founder',
    email: 'campbellc@ecpinvestments.com',
    linkedin: ''
  },
  {
    company: 'Levine Leichtman Capital Partners',
    filename: 'levine-leichtman-capital-partners.md',
    contact: 'David Wolmer',
    title: 'Partner, Co-Chief Operating Officer and General Counsel',
    email: 'dwolmer@llcp.com',
    linkedin: ''
  },
  {
    company: 'Peninsula Capital Partners',
    filename: 'peninsula-capital-partners.md',
    contact: 'Andrew Wiegand',
    title: 'Partner',
    email: 'wiegand@peninsulafunds.com',
    linkedin: ''
  }
];

function createOrUpdateDossier(lead) {
  const filePath = path.join(__dirname, DOSSIERS_DIR, lead.filename);
  const date = new Date().toISOString().split('T')[0];
  
  let content;
  if (fs.existsSync(filePath)) {
    // Update existing dossier
    content = fs.readFileSync(filePath, 'utf8');
    
    // Add or update contact section
    const contactSection = `\n## Contact\n- **Name:** ${lead.contact}\n- **Title:** ${lead.title}\n- **Email:** ${lead.email}\n- **Source:** Apollo API (verified)\n- **Date enriched:** ${date}\n`;
    
    if (content.includes('## Contact')) {
      // Replace existing contact section
      content = content.replace(/## Contact[\s\S]*?(##|$)/, contactSection + '\n$1');
    } else {
      // Add contact section at the end
      content += contactSection;
    }
    
    console.log(`✓ Updated ${lead.filename}`);
  } else {
    // Create new dossier
    content = `# ${lead.company}

## Overview
Private equity firm.

## Contact
- **Name:** ${lead.contact}
- **Title:** ${lead.title}
- **Email:** ${lead.email}
- **Source:** Apollo API (verified)
- **Date enriched:** ${date}

## Status
- Enriched: ${date}
- Ready for outreach

## Notes
Contact information obtained via Apollo API enrichment.
`;
    console.log(`✓ Created ${lead.filename}`);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('=== UPDATING DOSSIERS ===\n');
enrichedLeads.forEach(createOrUpdateDossier);
console.log(`\n✓ Updated ${enrichedLeads.length} dossiers in ${DOSSIERS_DIR}`);
