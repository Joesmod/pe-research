const fs = require('fs');
const path = require('path');

// Enrichment data for dossier updates
const enrichments = [
  {
    company: 'Audax Private Equity',
    folder: 'audax-private-equity',
    website: 'https://www.audaxprivateequity.com',
    contacts: [
      {
        name: 'Ken MacFadyen',
        title: 'Media Relations',
        email: 'media@audaxprivateequity.com',
        linkedin: '',
        source: 'BusinessWire press release Dec 2025'
      }
    ]
  },
  {
    company: 'Alvarez & Marsal Capital',
    folder: 'alvarez-marsal-capital',
    website: 'https://www.a-mcapital.com',
    contacts: [
      {
        name: 'David Perskie',
        title: 'Partner',
        email: 'david@a-mcapital.com',
        linkedin: 'https://www.linkedin.com/company/alvarez-marsal-capital-partners',
        source: 'PR Newswire Feb 2026, quoted in press release'
      },
      {
        name: 'Jack McCarthy',
        title: 'Co-Founder',
        email: 'jack@a-mcapital.com',
        linkedin: '',
        source: 'PR Newswire Feb 2026, quoted in press release'
      }
    ]
  },
  {
    company: 'JLL Partners',
    folder: 'jll-partners',
    website: 'https://www.jllpartners.com',
    contacts: [
      {
        name: 'Johanna Doherty',
        title: 'Media Contact',
        email: 'j.doherty@jllpartners.com',
        linkedin: '',
        source: 'BusinessWire press release Oct 2022'
      }
    ]
  },
  {
    company: 'Gryphon Investors',
    folder: 'gryphon-investors',
    website: 'https://www.gryphon-inv.com',
    contacts: [
      {
        name: 'Sandy McKinnon',
        title: 'Managing Director, Software',
        email: 'mckinnon@gryphoninvestors.com',
        linkedin: 'https://www.linkedin.com/in/sandy-mckinnon-b9b0a112',
        source: 'LinkedIn + email pattern verified'
      },
      {
        name: 'Timothy Bradley',
        title: 'Partner',
        email: 'bradley@gryphoninvestors.com',
        linkedin: 'https://www.linkedin.com/in/timothy-bradley-b755684',
        source: 'LinkedIn + email pattern verified'
      }
    ]
  },
  {
    company: 'Charlesbank Capital Partners',
    folder: 'charlesbank-capital-partners',
    website: 'https://www.charlesbank.com',
    contacts: [
      {
        name: 'Michael Choe',
        title: 'Managing Partner, CEO, Co-Head Flagship',
        email: 'mchoe@charlesbank.com',
        linkedin: 'https://www.charlesbank.com/team/michael-choe',
        source: 'Firm team page, pattern verified'
      },
      {
        name: 'Brandon White',
        title: 'Managing Partner, Co-Head Flagship',
        email: 'bwhite@charlesbank.com',
        linkedin: 'https://www.charlesbank.com/team/brandon-white',
        source: 'Firm team page, pattern verified'
      }
    ]
  },
  {
    company: 'Huron Capital',
    folder: 'huron-capital',
    website: 'https://www.huroncapital.com',
    contacts: [
      {
        name: 'Mike Beauregard',
        title: 'Founding Partner, Investment Committee',
        email: 'mbeauregard@huroncapital.com',
        linkedin: 'https://www.linkedin.com/in/beauregardmike',
        source: 'LinkedIn + email pattern verified'
      }
    ]
  },
  {
    company: 'Riverside Partners',
    folder: 'riverside-partners',
    website: 'https://riversidepartners.com',
    contacts: [
      {
        name: 'David Del Papa',
        title: 'General Partner',
        email: 'ddelpapa@riversidepartners.com',
        linkedin: 'https://www.linkedin.com/in/david-del-papa',
        source: 'LinkedIn + email pattern verified'
      }
    ]
  }
];

const baseDir = 'PE-firms';

console.log('\n📝 Updating PE firm dossiers...\n');

enrichments.forEach(firm => {
  const firmDir = path.join(baseDir, firm.folder);
  const dossierPath = path.join(firmDir, 'dossier.md');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
    console.log(`📁 Created directory: ${firmDir}`);
  }
  
  let dossier = '';
  
  // Check if dossier exists
  if (fs.existsSync(dossierPath)) {
    dossier = fs.readFileSync(dossierPath, 'utf8');
    console.log(`✏️  Updating existing dossier: ${firm.company}`);
  } else {
    console.log(`✨ Creating new dossier: ${firm.company}`);
    dossier = `# ${firm.company}

## Overview
- Website: ${firm.website}
- Last Updated: ${new Date().toISOString().split('T')[0]}

## Contacts

`;
  }
  
  // Add contacts section if not exists
  if (!dossier.includes('## Contacts')) {
    dossier += '\n## Contacts\n\n';
  }
  
  // Append new contacts
  firm.contacts.forEach(contact => {
    const contactBlock = `
### ${contact.name} - ${contact.title}
- **Email**: ${contact.email}
${contact.linkedin ? `- **LinkedIn**: ${contact.linkedin}` : ''}
- **Source**: ${contact.source}
- **Enriched**: ${new Date().toISOString().split('T')[0]}

`;
    
    // Only add if this contact isn't already in the dossier
    if (!dossier.includes(contact.email)) {
      dossier += contactBlock;
      console.log(`  ✅ Added: ${contact.name} (${contact.email})`);
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${contact.name}`);
    }
  });
  
  // Write back to file
  fs.writeFileSync(dossierPath, dossier);
  console.log('');
});

console.log('✨ Dossier updates complete!\n');
