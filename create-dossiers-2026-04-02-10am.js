const fs = require('fs').promises;
const path = require('path');

const enrichedFirms = [
  {
    company: 'Audax Private Equity',
    contact: 'Sergio Vieira',
    title: 'Executive Vice President and CFO, Private Equity Funds',
    email: 'svieira@audaxprivateequity.com',
    linkedin: 'http://www.linkedin.com/in/sergio-vieira-cpa-416b6010',
    source: 'Apollo API (enriched)'
  },
  {
    company: '424 Capital',
    contact: 'Scott Batzold',
    title: 'Vice President',
    email: 'sbatzold@424capital.com',
    linkedin: 'http://www.linkedin.com/in/scottbatzold',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Thesis Capital Partners',
    contact: 'Joshua Wolf',
    title: 'Partner',
    email: 'joshua.wolf@thesiscapital.com',
    linkedin: 'http://www.linkedin.com/in/joshua-wolf-cfa-a2088bb',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Regal Healthcare Capital Partners',
    contact: 'Harry Clifford',
    title: 'Vice President',
    email: 'hclifford@regalhcp.com',
    linkedin: 'http://www.linkedin.com/in/harry-clifford-3b7b39a7',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'SDC Capital Partners',
    contact: 'William Ouyang',
    title: 'Vice President',
    email: 'wouyang@sdccapitalpartners.com',
    linkedin: 'http://www.linkedin.com/in/william-ouyang-1a3120126',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Rockbridge Growth Equity, LLC',
    contact: 'Austin Fillmore',
    title: 'Vice President',
    email: 'austinfillmore@rbequity.com',
    linkedin: 'http://www.linkedin.com/in/austin-fillmore-a8228a127',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Aeris Partners',
    contact: 'Varaha Ande',
    title: 'Co-Founder & Chief Operating Officer Chief Financial Officer',
    email: 'vaande@iu.edu',
    linkedin: 'http://www.linkedin.com/in/varahaande',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Alvarez & Marsal Capital',
    contact: 'Jeffrey Legunn',
    title: 'Vice President',
    email: 'jlegunn@a-mcapital.com',
    linkedin: 'http://www.linkedin.com/in/jeffrey-legunn-58542233',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Blue Star Innovation Partners',
    contact: 'Brenden Hueston',
    title: 'Vice President',
    email: 'brenden@bluestarinnovationpartners.com',
    linkedin: 'http://www.linkedin.com/in/brenden-hueston-50b3bbba',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Casa Verde Capital',
    contact: 'Tony Ghanem',
    title: 'Vice President',
    email: 'tony@casaverdecapital.com',
    linkedin: 'http://www.linkedin.com/in/tony-ghanem-a89361133',
    source: 'Apollo API (enriched)'
  },
  {
    company: 'Eckuity Capital',
    contact: 'Victoria Rutson',
    title: 'Partner',
    email: 'victoria.manax@eckuity.com',
    linkedin: 'http://www.linkedin.com/in/victoria-manax-rutson-md-41400450',
    source: 'Apollo API (enriched)'
  }
];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createDossier(firm) {
  const slug = slugify(firm.company);
  const dirPath = path.join('PE-firms', slug);
  const filePath = path.join(dirPath, 'DOSSIER.md');
  
  // Create directory if it doesn't exist
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Directory might already exist, that's ok
  }
  
  // Check if dossier already exists
  let existingContent = '';
  try {
    existingContent = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    // File doesn't exist, create new
  }

  const dossierContent = `# ${firm.company}

## Primary Contact
- **Name:** ${firm.contact}
- **Title:** ${firm.title}
- **Email:** ${firm.email}
- **LinkedIn:** ${firm.linkedin || 'N/A'}

## Enrichment Source
${firm.source} - ${new Date().toISOString().split('T')[0]}

## Focus Areas
_To be researched_

## Portfolio Companies
_To be researched_

## Technology Stack
_To be researched_

## Outreach Status
- Status: Ready for outreach
- Last Updated: ${new Date().toISOString().split('T')[0]}

## Notes
Verified contact information enriched via Apollo API.
`;

  if (existingContent) {
    // Update existing dossier with new contact info
    console.log(`Updating: ${firm.company}`);
    // For now, just append the new info
    const updateNote = `\n---\n## Update ${new Date().toISOString().split('T')[0]}\nNew contact: ${firm.contact} (${firm.title}) - ${firm.email}\n`;
    await fs.writeFile(filePath, existingContent + updateNote);
  } else {
    console.log(`Creating: ${firm.company}`);
    await fs.writeFile(filePath, dossierContent);
  }
}

async function main() {
  console.log('Creating dossiers for 12 enriched PE firms...\n');
  
  // Remove duplicate (Regal Healthcare appears twice)
  const uniqueFirms = enrichedFirms.filter((firm, index, self) =>
    index === self.findIndex(f => f.company === firm.company)
  );
  
  for (const firm of uniqueFirms) {
    await createDossier(firm);
  }
  
  console.log(`\n✅ Created/updated ${uniqueFirms.length} dossiers`);
}

main().catch(console.error);
