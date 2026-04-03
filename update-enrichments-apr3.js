const fs = require('fs');
const path = require('path');

// Enrichment data from April 3, 2026 research session
const enrichments = [
  {
    slug: 'pamlico-capital',
    name: 'Pamlico Capital',
    contact: {
      name: 'L. Watts Hamrick III',
      title: 'Managing Partner',
      email: 'watts.hamrick@pamlicocapital.com',
      linkedin: 'https://www.linkedin.com/in/watts-hamrick-98912069/',
      verified: true,
      source: 'Official team page (pamlicocapital.com/team/l-watts-hamrick-iii)',
      notes: 'Focus: Services & Digital Infrastructure. One of original partners at First Union Capital Partners (pre-Pamlico).'
    }
  },
  {
    slug: 'bow-river-capital',
    name: 'Bow River Capital',
    contact: {
      name: 'Blair Richardson',
      title: 'Founder & CEO',
      email: 'info@bowrivercapital.com',
      linkedin: 'https://www.bowrivercapital.com/team',
      verified: false,
      generic: true,
      source: 'Official site contact (bowrivercapital.com)',
      notes: 'Canadian-born founder. Inducted into Hall of Fame (Nov 2025). Firm named after Canadian Bow River. Lower middle market PE, Denver.'
    }
  },
  {
    slug: 'ampersand-capital-partners',
    name: 'Ampersand Capital Partners',
    contact: {
      name: 'Herbert Hooper',
      title: 'Managing Partner',
      email: null,
      linkedin: 'https://ampersandcapital.com/team/herb-h-hooper/',
      verified: false,
      source: 'Official team page (ampersandcapital.com/team/herb-h-hooper/)',
      notes: 'Managing Partner since joining 2002. 30+ years healthcare PE experience. Former entrepreneur at Ampersand portfolio co ACLARA Biosciences. No direct email published.'
    }
  }
];

function updateDossier(enrichment) {
  const dossierPath = path.join(__dirname, 'PE-firms', enrichment.slug, 'DOSSIER.md');
  
  if (!fs.existsSync(dossierPath)) {
    console.log(`⚠️  Dossier not found: ${enrichment.slug}`);
    return;
  }
  
  let dossier = fs.readFileSync(dossierPath, 'utf8');
  
  // Update Contacts section
  const contactSection = `## 🤝 Key Contacts

- **${enrichment.contact.name}** — ${enrichment.contact.title}
  - ${enrichment.contact.email ? `Email: ${enrichment.contact.email}` : '_(No public email)_'}
  - LinkedIn: ${enrichment.contact.linkedin}
  - Source: ${enrichment.contact.source}
  - ${enrichment.contact.notes}`;
  
  // Check if Contacts section exists
  if (dossier.includes('## 🤝 Key Contacts')) {
    // Replace existing contacts section
    dossier = dossier.replace(/## 🤝 Key Contacts[\s\S]*?(?=\n## |$)/, contactSection + '\n\n');
  } else {
    // Add contacts section after Overview
    dossier = dossier.replace(/(## 📊 Overview[\s\S]*?\n\n)/, `$1${contactSection}\n\n`);
  }
  
  // Add research notes at the end
  const researchNote = `\n\n---\n**Last Enrichment:** April 3, 2026\n**Method:** Manual web research + official sources\n**Status:** ${enrichment.contact.email ? 'Direct email found' : 'Contact confirmed, no public email'}`;
  
  if (!dossier.includes('**Last Enrichment:** April 3, 2026')) {
    dossier += researchNote;
  }
  
  fs.writeFileSync(dossierPath, dossier);
  console.log(`✓ Updated: ${enrichment.name}`);
}

console.log('=== UPDATING DOSSIERS WITH APR 3 ENRICHMENT DATA ===\n');

enrichments.forEach(updateDossier);

console.log('\n=== DOSSIER UPDATES COMPLETE ===');
console.log(`Updated ${enrichments.length} dossiers with new contact information.`);
