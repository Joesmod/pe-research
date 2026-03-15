const fs = require('fs');
const path = require('path');

const results = JSON.parse(fs.readFileSync('apollo-enrichment-FIXED-2026-03-10T03-09-08-034Z.json', 'utf-8'));
const enriched = results.filter(r => r.email && r.email.length > 0);

console.log(`📝 Creating dossiers for ${enriched.length} enriched firms...\n`);

const dossierDir = '../../../pe-research/PE-firms';

// Check if directory exists
if (!fs.existsSync(dossierDir)) {
  console.log(`⚠️  Directory ${dossierDir} does not exist. Creating...`);
  fs.mkdirSync(dossierDir, { recursive: true });
}

for (const lead of enriched) {
  const firmSlug = lead.firm.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const filename = `${firmSlug}.md`;
  const filepath = path.join(dossierDir, filename);
  
  const dossier = `# ${lead.firm}

## Firm Information
- **Website**: ${lead.website || 'N/A'}
- **Status**: Active PE Firm
- **Enrichment Date**: 2026-03-09
- **Source**: Apollo API

## Key Contact
- **Name**: ${lead.contactName}
- **Title**: ${lead.title}
- **Email**: ${lead.email}
- **LinkedIn**: ${lead.linkedIn || 'N/A'}

## Notes
- Enriched via Apollo API on 2026-03-09
- Contact verified and added to CRM tracking sheet (Row ${lead.rowIndex})

## Outreach Status
- **Status**: Ready for Outreach
- **Added to Sheet**: 2026-03-09
- **Next Action**: Draft and send personalized outreach email

---
*Last Updated: 2026-03-09*
`;

  fs.writeFileSync(filepath, dossier, 'utf-8');
  console.log(`✅ Created: ${filename}`);
}

console.log(`\n✅ All dossiers created in: ${dossierDir}`);
console.log(`\n📝 Next: git add, commit, and push to https://github.com/Joesmod/pe-research`);
