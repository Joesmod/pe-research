const fs = require('fs');
const path = require('path');

const DOSSIER_DIR = 'PE-firms';
const timestamp = new Date().toISOString();

const NEW_FIRMS = [
  {
    name: 'Gemspring Capital',
    slug: 'gemspring-capital',
    website: 'https://www.gemspring.com',
    location: 'Westport, CT',
    founded: 2015,
    focus: 'Business Services, Healthcare, Industrial, Tech Services, Consumer',
    aum: 'Middle market (~$100M+ per deal)',
    contact: 'Clay Cole',
    title: 'Managing Director',
    email: 'clay@gemspring.com',
    notes: `Founded by Bret Wiener (ex-H.I.G. Capital). Over 100 acquisitions. Flexible capital solutions: LBOs, growth equity, carve-outs, recaps. Team has deep operational and investment experience. Email verified on company website.`
  },
  {
    name: 'Pamlico Capital',
    slug: 'pamlico-capital',
    website: 'https://www.pamlicocapital.com',
    location: 'Charlotte, NC',
    founded: 1988,
    focus: 'Healthcare IT, Information Services, Software, Tech-Enabled Services, Communications',
    aum: '~$4B total invested over 30+ years',
    contact: 'Trent Hickman',
    title: 'Managing Partner',
    email: '',
    notes: `Longstanding lower middle-market firm. Investment size up to $200M. Single office in Charlotte. Consistent track record. No public email found - contact via website form or LinkedIn.`
  },
  {
    name: 'VSS Capital Partners',
    slug: 'vss-capital-partners',
    website: 'https://www.vss.com',
    location: 'New York, NY',
    founded: 1987,
    focus: 'Healthcare, Business Services, Education',
    aum: 'Lower middle-market',
    contact: 'Trent Hickman',
    title: 'Co-Managing Partner',
    email: '',
    notes: `Formerly Veronis Suhler Stevenson. Growth financing, recaps, strategic acquisitions, buyouts. 2024: Pinnacle Investment Management acquired 22.5% stake. No public email found.`
  },
  {
    name: 'Bow River Capital',
    slug: 'bow-river-capital',
    website: 'https://www.bowrivercapital.com',
    location: 'Denver, CO',
    founded: 2003,
    focus: 'Healthcare Services, Industrial Services, Business Services',
    aum: '~$2.5B+ AUM',
    contact: 'Greg Hiatrides',
    title: 'Partner, Head of Private Equity',
    email: '',
    notes: `Multi-strategy firm: private equity, real estate, software growth equity. CEO: Blair Richardson. Lower middle-market focus. No public email found.`
  }
];

function createDossier(firm) {
  const dirPath = path.join(DOSSIER_DIR, firm.slug);
  
  // Create directory
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Create README.md
  const readme = `# ${firm.name}

**Website:** ${firm.website}  
**Location:** ${firm.location}  
**Founded:** ${firm.founded}  
**Focus:** ${firm.focus}  
**AUM:** ${firm.aum}

## Key Contact

- **${firm.contact}** - ${firm.title}${firm.email ? `\n- **Email:** ${firm.email}` : ''}

## Overview

${firm.notes}

## Research Notes

**Added:** ${new Date().toISOString().split('T')[0]}  
**Source:** Web research, company website team pages, public sources  
**Status:** ${firm.email ? 'Ready for outreach' : 'Needs email verification'}

## Next Steps

${firm.email ? 
  `- [ ] Draft personalized outreach email\n- [ ] Research recent portfolio companies\n- [ ] Identify specific value proposition` : 
  `- [ ] Find verified email (LinkedIn, conference bios, press releases)\n- [ ] Research additional decision-makers\n- [ ] Identify best contact approach`}

## Links

- [Company Website](${firm.website})
- [LinkedIn Company Page](https://www.linkedin.com/company/${firm.slug})

---

_Last updated: ${new Date().toISOString().split('T')[0]}_
`;

  fs.writeFileSync(path.join(dirPath, 'README.md'), readme);
  
  // Create contacts.json
  const contacts = {
    lastUpdated: timestamp,
    contacts: [
      {
        name: firm.contact,
        title: firm.title,
        email: firm.email || null,
        linkedin: '',
        source: firm.email ? 'Company website' : 'Company team page',
        verified: !!firm.email,
        notes: firm.email ? 'Email found on official company website' : 'Name confirmed, email not publicly available'
      }
    ]
  };
  
  fs.writeFileSync(path.join(dirPath, 'contacts.json'), JSON.stringify(contacts, null, 2));
  
  // Create research.md stub
  const research = `# Research Notes - ${firm.name}

## Company Overview

**Founded:** ${firm.founded}  
**Headquarters:** ${firm.location}  
**Website:** ${firm.website}

**Investment Focus:**
${firm.focus.split(',').map(f => `- ${f.trim()}`).join('\n')}

## Recent Activity

_To be filled in during deeper research_

## Portfolio Companies

_To be researched_

## Value Proposition for Hello Gumbo

_To be developed based on firm's specific needs and portfolio_

---

_Research started: ${new Date().toISOString().split('T')[0]}_
`;

  fs.writeFileSync(path.join(dirPath, 'research.md'), research);
  
  console.log(`✅ Created dossier: ${firm.name} (${firm.slug})`);
}

console.log('\n🗂️  Creating dossiers for 4 new PE firms...\n');

NEW_FIRMS.forEach(firm => {
  createDossier(firm);
});

console.log(`\n✅ All 4 dossiers created successfully!\n`);
console.log('Next step: Commit and push to GitHub repo');
console.log('  cd pe-research');
console.log('  git add PE-firms/');
console.log('  git commit -m "Add 4 new mid-market PE firms (Apr 4, 2026)"');
console.log('  git push origin main\n');
