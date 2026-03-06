const fs = require('fs');
const path = require('path');

const DOSSIER_DIR = path.join(__dirname, '..', '..', 'pe-research', 'PE-firms');
const enrichments = JSON.parse(fs.readFileSync('enrichment-results-2026-03-05-21-11.json', 'utf8'));

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function updateOrCreateDossier(enrich) {
  const slug = slugify(enrich.company);
  const dossierPath = path.join(DOSSIER_DIR, slug, 'README.md');
  const dossierDir = path.join(DOSSIER_DIR, slug);
  
  const contactEntry = `
## Contacts

### ${enrich.contactName}
- **Title:** ${enrich.title}
- **Email:** ${enrich.email}
- **LinkedIn:** ${enrich.linkedin}
- **Source:** Apollo API enrichment (2026-03-05)
- **Verified:** ✅
`;

  try {
    if (fs.existsSync(dossierPath)) {
      // Update existing dossier
      let content = fs.readFileSync(dossierPath, 'utf8');
      
      if (content.includes('## Contacts')) {
        // Append to existing contacts section
        content = content.replace(
          /## Contacts\n/,
          `## Contacts\n${contactEntry}\n`
        );
      } else {
        // Add contacts section
        content += `\n${contactEntry}`;
      }
      
      fs.writeFileSync(dossierPath, content);
      console.log(`✅ Updated: ${slug}`);
      
    } else {
      // Create new dossier
      if (!fs.existsSync(dossierDir)) {
        fs.mkdirSync(dossierDir, { recursive: true });
      }
      
      const newDossier = `# ${enrich.company}

${contactEntry}

## Status
- Enriched: 2026-03-05
- Last Updated: ${new Date().toISOString().slice(0, 10)}

## Notes
Apollo API enrichment via automated cron job. Contact verified and added to CRM.
`;
      
      fs.writeFileSync(dossierPath, newDossier);
      console.log(`✅ Created: ${slug}`);
    }
  } catch (error) {
    console.log(`❌ ${slug}: ${error.message}`);
  }
}

console.log(`\n=== UPDATING GITHUB DOSSIERS ===\n`);

enrichments.forEach(updateOrCreateDossier);

console.log(`\n✅ Dossier updates complete\n`);
