const fs = require('fs');
const path = require('path');

// Read enrichment log
const log = JSON.parse(fs.readFileSync('enrichment-log-0336pm.json', 'utf8'));

// Dossier directory
const dossierDir = 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\pe-research\\PE-firms';

function createDossier(lead) {
  const filename = lead.company
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-') + '.md';
  
  const filepath = path.join(dossierDir, filename);

  const content = `# ${lead.company}

**Updated:** ${new Date().toISOString().split('T')[0]}  
**Status:** Enriched - Contact Found

## Key Contacts

### ${lead.contact}
- **Title:** ${lead.title}
- **Email:** ${lead.email}
- **Email Status:** ${lead.emailStatus}
${lead.linkedin ? `- **LinkedIn:** ${lead.linkedin}\n` : ''}- **Source:** Apollo API enrichment (March 3, 2026)

## Relevance to Gumbo
- ✅ Decision-maker contact identified
- 🎯 Target for outreach regarding AI operational improvements

## Next Steps
- Research firm's portfolio companies for AI/operational improvement opportunities
- Craft personalized outreach message highlighting relevant case studies
- Monitor for portfolio company announcements
`;

  fs.writeFileSync(filepath, content);
  console.log(`✓ Created dossier: ${filename}`);
  return filename;
}

async function main() {
  console.log('=== Creating Dossiers ===\n');

  const created = [];
  for (const lead of log) {
    const filename = createDossier(lead);
    created.push(filename);
  }

  console.log(`\n✓ Created ${created.length} dossiers`);
  console.log('\nFiles created:');
  created.forEach(f => console.log(`  - ${f}`));
}

main().catch(console.error);
