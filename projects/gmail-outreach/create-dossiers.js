const fs = require('fs');
const path = require('path');

const PE_FIRMS_DIR = 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\pe-research\\PE-firms';
const enrichments = JSON.parse(fs.readFileSync('enrichment-batch.json', 'utf8'));

function slugify(name) {
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function createDossier(enrichment) {
  const slug = slugify(enrichment.company);
  const firmDir = path.join(PE_FIRMS_DIR, slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
    console.log(`✓ Created directory: ${slug}`);
  } else {
    console.log(`  Directory exists: ${slug}`);
  }
  
  // Create/update DOSSIER.md
  const dossierPath = path.join(firmDir, 'DOSSIER.md');
  const existingContent = fs.existsSync(dossierPath) 
    ? fs.readFileSync(dossierPath, 'utf8') 
    : '';
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  const dossier = `# ${enrichment.company}

**Website:** ${enrichment.website}
**Focus:** Private Equity
**AUM:** (To be determined)

## Key Contacts

### ${enrichment.contact}
- **Title:** ${enrichment.title}
- **Email:** ${enrichment.email}
- **LinkedIn:** ${enrichment.linkedin}
- **Last Updated:** ${timestamp}
- **Source:** ${enrichment.notes}

## Overview

${enrichment.company} is a private equity firm. Further research needed to complete profile.

## Investment Thesis

(To be researched)

## Portfolio Focus

(To be researched)

## Outreach Status

- **Status:** ${enrichment.status}
- **Last Contact:** N/A
- **Next Steps:** Prepare initial outreach

---
*Dossier created: ${timestamp}*
*Last enrichment: ${timestamp} via PE Research Cron*
`;
  
  fs.writeFileSync(dossierPath, dossier);
  console.log(`  ✓ Created/updated DOSSIER.md for ${enrichment.company}`);
  
  return slug;
}

console.log(`Creating dossiers for ${enrichments.length} firms...\n`);

const created = [];
for (const enrichment of enrichments) {
  const slug = createDossier(enrichment);
  created.push(slug);
}

console.log(`\n✓ Created/updated ${created.length} dossiers:`);
created.forEach(slug => console.log(`  - ${slug}`));
