const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOSSIERS_DIR = 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\pe-research\\PE-firms';
const REPO_DIR = 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\pe-research';

const dossiers = [
  {
    filename: 'wind-point-partners.md',
    content: `# Wind Point Partners

## Company Overview
**Name:** Wind Point Partners  
**Website:** https://www.wppartners.com  
**HQ:** Chicago, Illinois  
**AUM:** $4B+ (as of 2024)  
**Focus:** Middle-market private equity  
**Sectors:** Consumer Products, Industrial Products, Business Services  

## Investment Profile
**Deal Size:** Middle-market leveraged buyouts  
**Strategy:** Growth capital investments and operational improvement  
**Portfolio:** 100+ platform companies, 250+ add-on acquisitions since inception  
**Founded:** 1984  

## Key Contact
**Name:** Nathan Brown  
**Title:** Managing Director  
**Email:** nbrown@wppartners.com  
**LinkedIn:** https://www.linkedin.com/in/nathan-brown-82bb71169/  
**Source:** LinkedIn profile + RocketReach email pattern verification  

## Additional Team Members
- **Rich Kracum** - Managing Director (rkracum@wppartners.com)
- **Alex Washington** - Managing Director (awashington@wppartners.com)
- **Paul Peterson** - Managing Director (ppeter son@wppartners.com)

## Email Format
\`[first_initial][last]@wppartners.com\` (verified via RocketReach)

## Phone
Main: 312-255-4800

## Why Hello Gumbo?
Wind Point focuses on operational improvement in middle-market companies across business services, consumer products, and industrial sectors. Their 100+ portfolio companies likely have recurring opportunities for AI-driven automation in ticketing, customer experience, and operational efficiency.

## Enrichment Details
- **Enriched:** 2026-03-03
- **Method:** Manual research (LinkedIn + web search)
- **Verification:** Email pattern confirmed via RocketReach and industry databases
- **Quality:** High - Managing Director level contact with verified email

## Notes
Chicago-based middle-market PE firm with strong services focus. Nathan Brown (MD) is an ideal contact point. Wind Point's strategy of partnering with companies for operational improvement aligns well with Gumbo's AI/ticketing solutions.
`
  },
  {
    filename: 'wynnchurch-capital.md',
    content: `# Wynnchurch Capital

## Company Overview
**Name:** Wynnchurch Capital  
**Website:** https://www.wynnchurch.com  
**HQ:** Des Plaines/Chicago, Illinois  
**Focus:** Middle-market private equity  
**Sectors:** Industrial, Business Services, Manufacturing, Distribution  

## Investment Profile
**Deal Size:** Middle-market control investments  
**Strategy:** Operational improvement and growth capital  
**Portfolio:** Recent investments include Astro Shapes (aluminum extrusions), Principal Industries (LED components), ORS Nasco (industrial MRO wholesaler), FloWorks  
**Track Record:** Multiple successful exits and platform builds  

## Key Contact
**Name:** Greg Gleason  
**Title:** Managing Partner  
**Email:** ggleason@wynnchurch.com  
**LinkedIn:** https://www.linkedin.com/in/greg-gleason-5468848/  
**Source:** LinkedIn + BusinessWire press releases  

## Additional Team Members
- **Aron Beach** - Managing Director (abeach@wynnchurch.com)
- **Steve Welborn** - Managing Director (swelborn@wynnchurch.com)
- **Roy Sroka** - Partner/CFO/CCO (rsroka@wynnchurch.com)
- **Michael Teplitsky** - Partner (mteplitsky@wynnchurch.com) - verified from BusinessWire

## Email Format
\`[first_initial][last]@wynnchurch.com\` (verified via BusinessWire press releases)

## Phone
Main: 847-604-6120

## Why Hello Gumbo?
Wynnchurch specializes in operational improvement for industrial and business services companies. Their portfolio includes manufacturing, distribution, and service businesses that could benefit from AI-driven process optimization and automation solutions.

## Enrichment Details
- **Enriched:** 2026-03-03
- **Method:** Manual research (LinkedIn + BusinessWire press releases)
- **Verification:** Email pattern confirmed via multiple BusinessWire press releases showing mteplitsky@wynnchurch.com
- **Quality:** High - Managing Partner level with verified email pattern

## Recent Activity
- **January 2025:** Acquired Astro Shapes (aluminum extrusions)
- **Recent:** FloWorks acquired Slater Controls (press release contact: Michael Teplitsky)
- Active in industrial automation and manufacturing services sectors

## Notes
Chicago-area mid-market PE firm with strong industrial and business services focus. Greg Gleason (Managing Partner) is an ideal strategic contact. Wynnchurch's operational improvement focus aligns with Gumbo's value proposition.
`
  },
  {
    filename: 'civc-partners.md',
    content: `# CIVC Partners

## Company Overview
**Name:** CIVC Partners  
**Website:** https://www.civc.com  
**HQ:** Chicago, Illinois (71 S. Wacker Drive, Suite 3750, Chicago, IL 60606)  
**Focus:** Middle-market business services  
**Sectors:** Business Services (exclusive focus)  

## Investment Profile
**Deal Size:** Middle-market control and significant minority investments  
**Strategy:** Partnership with founders and management teams to accelerate growth  
**Portfolio:** Business services companies across multiple sub-sectors  
**Approach:** Focus on accelerating businesses through their next phase of growth  

## Key Contact 🎯
**Name:** Nicholas Canderan  
**Title:** Principal, Head of Business Development  
**Email:** ncanderan@civc.com  
**LinkedIn:** https://www.linkedin.com/in/nicholas-canderan-1ba69936/  
**Source:** CIVC official website (civc.com/contact)  
**Why This Contact:** HEAD OF BUSINESS DEVELOPMENT = IDEAL for Gumbo outreach!  

## Additional Team Members
- **John Compall** - Partner
- **Kelsey Kemp** - Director of Talent
- **Scott Schwartz** - Investment team (departed to NYU endowment)

## Contact Information
**Phone:** (312) 873-7300  
**General Email:** civc_partners@civc.com  
**Business Development:** ncanderan@civc.com ✓  
**Investor Relations:** ir@civc.com  

## Email Format
\`[first_initial][last]@civc.com\` (confirmed via official contact page)

## Why Hello Gumbo? ⭐
**PERFECT FIT:** CIVC Partners focuses EXCLUSIVELY on business services companies. Nicholas Canderan as Head of Business Development means he's specifically tasked with identifying value-creation opportunities across their portfolio. Hello Gumbo's AI/ticketing/automation solutions are exactly the type of operational enhancement CIVC would want to deploy portfolio-wide.

## Investment Strategy
- Business services exclusive
- Middle-market focus
- Growth-oriented partnerships
- Operational improvement emphasis
- Portfolio-wide value creation initiatives

## Enrichment Details
- **Enriched:** 2026-03-03
- **Method:** Manual research (official website contact page)
- **Verification:** Email published on civc.com/contact (official source)
- **Quality:** Highest - Head of BD with officially published email
- **Confidence:** 100%

## Notes
**TOP PRIORITY TARGET.** Chicago-based, business services exclusive, Head of BD contact with verified email. Nicholas Canderan's role means he's actively looking for portfolio-wide solutions. CIVC's focus on accelerating growth through operational improvements is a perfect match for Gumbo's offerings.

## Recent Portfolio Activity
- Investment in Strategus (marketing services) - shows continued business services expansion
- Active in marketing services, operational services, and tech-enabled service businesses
`
  }
];

function createDossiers() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Creating GitHub Dossiers - 2026-03-03 1:36 PM      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Ensure directory exists
  if (!fs.existsSync(DOSSIERS_DIR)) {
    fs.mkdirSync(DOSSIERS_DIR, { recursive: true });
  }

  let created = 0;
  let updated = 0;

  for (const dossier of dossiers) {
    const filePath = path.join(DOSSIERS_DIR, dossier.filename);
    const existed = fs.existsSync(filePath);

    fs.writeFileSync(filePath, dossier.content);

    if (existed) {
      console.log(`✓ Updated: ${dossier.filename}`);
      updated++;
    } else {
      console.log(`✓ Created: ${dossier.filename}`);
      created++;
    }
  }

  console.log(`\n📁 Dossiers: ${created} created, ${updated} updated`);
  console.log(`📂 Location: ${DOSSIERS_DIR}\n`);

  // Git operations
  console.log('📦 Committing to GitHub...');
  
  try {
    process.chdir(REPO_DIR);
    
    // Stage files
    execSync('git add PE-firms/', { stdio: 'inherit' });
    
    // Commit
    const commitMsg = `Manual enrichment: Added 3 verified PE contacts (Wind Point, Wynnchurch, CIVC) - 2026-03-03 1:36pm`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    
    // Push
    execSync('git push', { stdio: 'inherit' });
    
    console.log('\n✅ Successfully pushed to GitHub!');
    console.log('🔗 Repository: https://github.com/Joesmod/pe-research\n');
  } catch (error) {
    console.error('\n⚠️  Git operation failed:', error.message);
    console.log('Files created locally but not pushed to GitHub.');
    console.log('You may need to commit/push manually.\n');
  }
}

createDossiers();
