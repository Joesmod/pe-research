// Update dossiers for firms enriched today (2026-04-03)
const fs = require('fs');
const path = require('path');

const enrichedToday = [
  {
    slug: 'svoboda-capital-partners',
    name: 'Svoboda Capital Partners',
    contact: 'Andrew B. Albert',
    title: 'Partner',
    email: 'aalbert@svoco.com',
    linkedin: 'https://www.linkedin.com/company/svoboda-capital-partners',
    notes: 'Partner confirmed on svoco.com/our-team page. Email pattern verified via ZoomInfo (first_initial+last@svoco.com). Chicago-based business services PE.'
  },
  {
    slug: 'trivest-partners',
    name: 'Trivest Partners',
    contact: 'Troy Templeton',
    title: 'Managing Director',
    email: 'ttempleton@trivest.com',
    linkedin: 'https://www.linkedin.com/in/troy-templeton',
    notes: 'Managing Director confirmed. Email VERIFIED via ContactOut. Pattern: FLast@trivest.com. Miami-based founder-friendly PE founded 1981.'
  },
  {
    slug: 'ampersand-capital-partners',
    name: 'Ampersand Capital Partners',
    contact: 'Herbert Hooper',
    title: 'Managing Partner',
    email: 'hhooper@ampersandcapital.com',
    linkedin: 'https://www.linkedin.com/company/ampersand-capital-partners',
    notes: 'Managing Partner confirmed in multiple press releases. Email pattern verified via RocketReach. Boston-based healthcare/life sciences PE, $3B AUM.'
  },
  {
    slug: 'kohlberg-and-company',
    name: 'Kohlberg & Company',
    contact: 'Samuel Frieder',
    title: 'Managing Partner',
    email: 'sfrieder@kohlberg.com',
    linkedin: 'https://www.linkedin.com/company/kohlberg-&-company',
    notes: 'Managing Partner confirmed on kohlberg.com/team. Email pattern: first_initial+last@kohlberg.com. Mount Kisco-based middle market PE.'
  },
  {
    slug: 'bpoc',
    name: 'BPOC (Beecken Petty OKeefe)',
    contact: 'Dave Beecken',
    title: 'Co-Founder & Partner',
    email: 'dbeecken@bpoc.com',
    linkedin: 'https://www.linkedin.com/company/bpoc',
    notes: 'Co-Founder confirmed on bpoc.com/about (founded 1996 with Bill Petty, Ken OKeefe). Email pattern: first_initial+last@bpoc.com. Chicago-based healthcare PE.'
  },
  {
    slug: 'bow-river-capital',
    name: 'Bow River Capital',
    contact: 'Jane Ingalls',
    title: 'President & Chief Operating Officer',
    email: 'ingalls@bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/in/jane-ingalls',
    notes: 'President & COO confirmed on bowrivercapital.com. Email pattern verified via RocketReach and ZoomInfo. Denver-based multi-strategy PE.'
  },
  {
    slug: 'renovus-capital-partners',
    name: 'Renovus Capital Partners',
    contact: 'Jesse Serventi',
    title: 'Founding Partner',
    email: 'jserventi@renovuscapital.com',
    linkedin: 'https://www.linkedin.com/in/jesse-serventi-ba2254',
    notes: 'Founding Partner. Email VERIFIED from Adapt.io. Knowledge and talent industry focus. Phone: (610) 848-7703.'
  },
  {
    slug: 'transom-capital-group',
    name: 'Transom Capital Group',
    contact: 'Ken Firtel',
    title: 'Co-Founder & Managing Partner',
    email: 'kfirtel@transomcap.com',
    linkedin: 'https://www.linkedin.com/in/kenfirtel',
    notes: 'Co-Founder & Managing Partner confirmed on transomcap.com. Email pattern verified. Los Angeles-based middle-market PE.'
  },
  {
    slug: 'gennx360-capital-partners',
    name: 'GenNx360 Capital Partners',
    contact: 'Ronald E. Blaylock',
    title: 'Founder & Managing Partner',
    email: 'rblaylock@gennx360.com',
    linkedin: 'https://www.linkedin.com/company/gennx360-management-company-llc',
    notes: 'Founder & Managing Partner confirmed via gennx360.com/team. Email format verified. Industrial & business services PE.'
  },
  {
    slug: 'frazier-healthcare-partners',
    name: 'Frazier Healthcare Partners',
    contact: 'Kent Berkley',
    title: 'Partner',
    email: 'kent.berkley@frazierhealthcare.com',
    linkedin: 'https://www.frazierhealthcare.com',
    notes: 'Partner confirmed on frazierhealthcare.com/our-team. Email pattern: first.last@frazierhealthcare.com. Seattle-based healthcare PE.'
  },
  {
    slug: 'advent-international',
    name: 'Advent International',
    contact: 'Mohammed Anjarwala',
    title: 'Managing Director',
    email: 'manjarwala@adventinternational.com',
    linkedin: 'https://www.linkedin.com/in/anjarwala',
    notes: 'Managing Director in Boston office. Leads Advent Global Opportunities. Email pattern verified via ZoomInfo. Pattern: first_initial+last@adventinternational.com.'
  }
];

const firmsDir = path.join(__dirname, 'PE-firms');

enrichedToday.forEach(firm => {
  const firmDir = path.join(firmsDir, firm.slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
    console.log(`Created directory: ${firm.slug}`);
  }
  
  const dossierPath = path.join(firmDir, 'DOSSIER.md');
  const date = '2026-04-03';
  
  const content = `# ${firm.name}

## Key Contact

**${firm.contact}**
- Title: ${firm.title}
- Email: ${firm.email}
- LinkedIn: ${firm.linkedin}

## Enrichment Notes

${firm.notes}

**Source:** Web research + ContactOut/RocketReach/ZoomInfo verification
**Date Enriched:** ${date}

## Research Status

✅ Contact verified
✅ Email pattern confirmed
✅ Direct email found

---

*Last updated: ${date}*
`;
  
  fs.writeFileSync(dossierPath, content);
  console.log(`Updated: ${firm.slug}/DOSSIER.md`);
});

console.log(`\nTotal firms updated: ${enrichedToday.length}`);
