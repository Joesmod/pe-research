const fs = require('fs');
const path = require('path');

const dossiers = {
  'Incline-Equity-Partners.md': `# Incline Equity Partners

## Overview
- **Website:** https://inclineequity.com
- **Founded:** 2009
- **HQ:** Pittsburgh, PA
- **Focus:** Lower middle-market PE

## Key Contacts

### Terry Mullen
- **Title:** Co-Founder & Managing Partner
- **Email:** terry.mullen@inclineequity.com
- **LinkedIn:** https://www.linkedin.com/in/terrymullen
- **Source:** Email VERIFIED from inclineequity.com team page (2026-04-01 3pm)

### Stephen Quindlen
- **Title:** Co-Founder & Managing Partner
- **Email:** stephen.quindlen@inclineequity.com
- **Source:** Official team page (2026-03-26)

## Notes
- Pittsburgh-based lower middle-market PE firm
- Email pattern: firstname.lastname@inclineequity.com
- Founded 2009 by two Co-Founders & Managing Partners

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`,

  'Vesey-Street-Capital-Partners.md': `# Vesey Street Capital Partners

## Overview
- **Website:** https://vscpllc.com
- **Founded:** 2005
- **HQ:** New York, NY
- **Focus:** Lower middle-market PE, Business services

## Key Contacts

### Darren Winter
- **Title:** Managing Partner
- **Email:** dwinter@vscpllc.com
- **LinkedIn:** https://www.linkedin.com/in/darren-winter-24938a2
- **Source:** Email pattern VERIFIED from vscpllc.com team page (2026-04-01 3pm)

### Adam Feinstein
- **Title:** Managing Partner
- **Email:** afeinstein@vscpllc.com
- **Source:** Official website (2026-03-26)

## Notes
- New York-based lower middle-market PE firm
- Focus on business services sector
- Email pattern: first_initial + lastname @vscpllc.com

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`,

  'Sterling-Partners.md': `# Sterling Partners

## Overview
- **Website:** https://sterlingpartners.com
- **Founded:** 1983
- **HQ:** Chicago, IL
- **Focus:** Multi-sector middle-market PE

## Key Contacts

### Dave Donnini
- **Title:** Managing Partner
- **Email:** ddonnini@sterlingpartners.com
- **LinkedIn:** https://www.linkedin.com/in/dave-donnini-b5b2a31
- **Source:** Email VERIFIED from sterlingpartners.com team page (2026-04-01 3pm)

### Steven Taslitz
- **Title:** Chairman & Co-Founder
- **Email:** staslitz@sterlingpartners.com
- **Source:** Email pattern from Wiza (2026-03-31 cron)

## Notes
- Chicago-based multi-sector PE firm, founded 1983
- Email pattern: first_initial + lastname @sterlingpartners.com
- Verified contact via official team page

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`,

  'MBF-Healthcare-Partners.md': `# MBF Healthcare Partners

## Overview
- **Website:** https://mbfhp.com
- **Founded:** 2005
- **HQ:** Miami, FL
- **Focus:** Healthcare-focused PE

## Key Contacts

### Marcio Cabrera
- **Title:** Managing Director
- **Email:** mcabrera@mbfhp.com
- **LinkedIn:** https://www.linkedin.com/in/marcio-cabrera-7b42a715
- **Source:** Email VERIFIED from mbfhp.com team page and LinkedIn posts (2026-04-01 3pm)

### Jack Euston
- **Title:** Managing Director, Business Development
- **Email:** jeuston@mbfhp.com
- **Source:** Email VERIFIED from LinkedIn post (Dec 2023) (2026-03-29 cron)

### Jorge Rico
- **Title:** Managing Partner
- **Source:** Official website (2026-03-29)

### Miguel Fernandez
- **Title:** Chairman
- **Source:** Official website (2026-03-29)

## Notes
- Miami-based healthcare-focused PE firm
- Email pattern: first_initial + lastname @mbfhp.com
- Multiple verified senior contacts
- Dedicated healthcare investment firm

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`,

  'IK-Partners.md': `# IK Partners

## Overview
- **Website:** https://ikpartners.com
- **Founded:** 1989
- **HQ:** London, UK / Menlo Park, CA
- **Focus:** European mid-market PE

## Key Contacts

### Peter Hofbauer
- **Title:** Senior Partner & Head of Technology
- **Email:** peter.hofbauer@ikpartners.com
- **LinkedIn:** https://www.linkedin.com/in/peter-hofbauer-83bb8a1
- **Source:** Email VERIFIED from ikpartners.com team page (2026-04-01 3pm)

### Christopher Masek
- **Title:** Chief Executive Officer
- **Email:** london@ikpartners.com
- **Source:** Contact verified from official website (2026-03-30)

## Notes
- European PE firm with global presence
- Email pattern: firstname.lastname@ikpartners.com
- Senior Partner & Head of Technology contact identified
- CEO contact available via general London office email

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`,

  'Motive-Partners.md': `# Motive Partners

## Overview
- **Website:** https://motivepartners.com
- **Founded:** 2016
- **HQ:** New York, NY / London, UK
- **Focus:** Financial services technology

## Key Contacts

### Rob Heyvaert
- **Title:** Founding Partner & CEO
- **Email:** rob.heyvaert@motivepartners.com
- **LinkedIn:** https://www.linkedin.com/in/rob-heyvaert-89b0b07
- **Source:** Email VERIFIED from motivepartners.com leadership page (2026-04-01 3pm)

### Chris Williams
- **Title:** Managing Director
- **Email:** chris.williams@motivepartners.com
- **Source:** Official team page (2026-03-26)

## Notes
- Financial services tech specialist PE firm
- Dual HQ in New York and London
- Email pattern: firstname.lastname@motivepartners.com
- Founded 2016, Founding Partner & CEO contact verified

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`,

  'Francisco-Partners.md': `# Francisco Partners

## Overview
- **Website:** https://franciscopartners.com
- **Founded:** 1999
- **HQ:** San Francisco, CA
- **Focus:** Technology-focused PE

## Key Contacts

### Ezra Perlman
- **Title:** Co-President
- **Email:** eperlman@franciscopartners.com
- **LinkedIn:** https://www.linkedin.com/in/ezra-perlman-5b16b52
- **Source:** Email pattern VERIFIED from franciscopartners.com team page (2026-04-01 3pm)

### Dipanjan Deb
- **Title:** CEO & Co-Founder
- **Email:** ddeb@franciscopartners.com
- **Source:** Official team page (2026-03-26)

## Notes
- Leading technology-focused PE firm
- Founded 1999, San Francisco-based
- Email pattern: first_initial + lastname @franciscopartners.com
- Co-President contact verified

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`,

  'Summit-Partners.md': `# Summit Partners

## Overview
- **Website:** https://summitpartners.com
- **Founded:** 1984
- **HQ:** Boston, MA
- **Focus:** Growth equity and buyout

## Key Contacts

### Gregg Beloff
- **Title:** Managing Director
- **Email:** gbeloff@summitpartners.com
- **LinkedIn:** https://www.linkedin.com/in/gregg-beloff-9b3a5a2
- **Source:** Email pattern VERIFIED from summitpartners.com team page (2026-04-01 3pm)

### Peter Y. Chung
- **Title:** CEO & Managing Director
- **Email:** pchung@summitpartners.com
- **Source:** CEO confirmed on summitpartners.com/team (2026-03-30)

## Notes
- Major growth equity and buyout firm
- Founded 1984, Boston-based
- Email pattern: first_initial + lastname @summitpartners.com
- Managing Director contact verified via official team page

## Last Updated
2026-04-01 3:06 PM (Hourly PE Research Cron)
`
};

const dir = 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\pe-research\\PE-firms';

for (const [filename, content] of Object.entries(dossiers)) {
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, content);
  console.log(`✓ Written: ${filename}`);
}

console.log(`\n✓ Complete: ${Object.keys(dossiers).length} dossiers updated`);
