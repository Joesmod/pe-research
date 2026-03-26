const fs = require('fs');
const path = require('path');

// New enriched firms
const newFirms = [
  {
    company: 'Gemspring Capital',
    slug: 'gemspring-capital',
    contacts: [
      { name: 'Thomas Henry', title: 'Vice President', email: 'thenry@gemspring.com', linkedin: 'http://www.linkedin.com/in/tprhenr' }
    ]
  },
  {
    company: 'Gryphon Investors',
    slug: 'gryphon-investors',
    contacts: [
      { name: 'John Emm', title: 'Vice President', email: 'emm@gryphoninvestors.com', linkedin: 'http://www.linkedin.com/in/john-emm' }
    ]
  },
  {
    company: 'Sterling Investment Partners',
    slug: 'sterling-investment-partners',
    contacts: [
      { name: 'Dan Yu', title: 'Partner', email: 'yu@sterlinglp.com', linkedin: 'http://www.linkedin.com/in/dan-yu-a5a73713' }
    ]
  },
  {
    company: 'Blue Point Capital Partners',
    slug: 'blue-point-capital-partners',
    contacts: [
      { name: 'Alex Weinstein', title: 'Vice President', email: 'aweinstein@bluepointcapital.com', linkedin: 'http://www.linkedin.com/in/alex-weinstein-488a9874' }
    ]
  }
];

const baseDir = 'pe-research/PE-firms';

function updateDossier(firm) {
  const firmDir = path.join(baseDir, firm.slug);
  const contactsFile = path.join(firmDir, 'CONTACTS.md');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
    console.log(`Created directory: ${firmDir}`);
  }
  
  // Generate contacts content
  let content = `# ${firm.company} - Contacts\n\n`;
  content += `*Enriched: ${new Date().toISOString().split('T')[0]}*\n`;
  content += `*Source: Apollo.io*\n\n`;
  
  firm.contacts.forEach(contact => {
    content += `## ${contact.name}\n`;
    content += `- **Title:** ${contact.title}\n`;
    content += `- **Email:** ${contact.email}\n`;
    content += `- **LinkedIn:** [Profile](${contact.linkedin})\n\n`;
  });
  
  // Write CONTACTS.md
  fs.writeFileSync(contactsFile, content);
  console.log(`Updated: ${contactsFile}`);
}

console.log('Creating dossiers for new PE firms...\n');

newFirms.forEach(firm => {
  updateDossier(firm);
});

console.log('\n✓ New firm dossiers complete!');
