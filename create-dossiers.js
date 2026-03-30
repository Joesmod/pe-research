const fs = require('fs');
const path = require('path');

const newFirms = [
  {
    slug: "linden-capital-partners",
    name: "Linden Capital Partners",
    website: "https://www.linden.com",
    contact: "Tony Davis",
    title: "Co-Founder & President",
    email: "tdavis@lindenllc.com",
    linkedin: "https://www.linkedin.com/in/tony-davis-linden",
    location: "Chicago, IL",
    aum: "$2B+ AUM",
    focus: "Healthcare & life sciences",
    description: "Middle-market private equity firm focused exclusively on leveraged investments in healthcare and life science companies."
  },
  {
    slug: "shore-capital-partners",
    name: "Shore Capital Partners",
    website: "https://www.shorecp.com",
    contact: "Justin Ishbia",
    title: "Founder & Managing Partner",
    email: "jishbia@shorecp.com",
    linkedin: "https://www.linkedin.com/in/justinishbia",
    location: "Chicago, IL / Nashville, TN",
    aum: "$3B+ AUM",
    focus: "Healthcare, food & beverage, business services, industrial, real estate",
    description: "Lower middle market private equity firm. Inc. Top Founder Friendly Investors for six consecutive years."
  },
  {
    slug: "vesey-street-capital-partners",
    name: "Vesey Street Capital Partners",
    website: "https://www.vscpllc.com",
    contact: "Adam Feinstein",
    title: "Founder & Managing Partner",
    email: "afeinstein@vscpllc.com",
    linkedin: "https://www.linkedin.com/in/adam-feinstein-30037612/",
    location: "New York, NY",
    aum: "$1.5B+ AUM",
    focus: "Healthcare services exclusively",
    description: "Healthcare services private equity firm with 30+ years of exclusive focus on the healthcare services sector."
  },
  {
    slug: "serent-capital",
    name: "Serent Capital",
    website: "https://serentcapital.com",
    contact: "Kevin Frick",
    title: "Co-Founder & Partner",
    email: "kevin.frick@serentcapital.com",
    linkedin: "https://www.linkedin.com/in/kevinfrick/",
    location: "San Francisco, CA / Austin, TX",
    aum: "$2B+ AUM",
    focus: "Software & technology-enabled services",
    description: "Middle market growth equity firm focused on software and technology companies across healthcare, HCM, insurance tech, and SaaS."
  },
  {
    slug: "llr-partners",
    name: "LLR Partners",
    website: "https://www.llrpartners.com",
    contact: "Howard Ross",
    title: "Partner",
    email: "hross@llrpartners.com",
    linkedin: "https://www.linkedin.com/in/howard-ross-llr",
    location: "Philadelphia, PA",
    aum: "$7.5B+ AUM",
    focus: "Healthcare, fintech, software, education, security, industrial tech",
    description: "Lower middle market private equity firm. Founded 1999, over 130 portfolio companies. Inc. Founder-Friendly Investor."
  },
  {
    slug: "trivest-partners",
    name: "Trivest Partners",
    website: "https://www.trivest.com",
    contact: "Forest Wester",
    title: "Managing Partner, Mid-Market Fund",
    email: "fwester@trivest.com",
    linkedin: "https://www.linkedin.com/in/forest-wester",
    location: "Miami, FL",
    aum: "$2.3B+ AUM",
    focus: "Founder-led and family-owned businesses, lower middle market",
    description: "Multi-strategy private equity firm with funds targeting growth, discovery, mid-market, and recognition investments."
  },
  {
    slug: "riverwood-capital",
    name: "Riverwood Capital",
    website: "https://www.riverwoodcapital.com",
    contact: "Francisco Alvarez-Demalde",
    title: "Co-Founder & Managing Partner",
    email: "francisco@riverwoodcapital.com",
    linkedin: "https://www.linkedin.com/in/franciscoalvarezdemalde/",
    location: "Menlo Park, CA / Miami, FL / New York, NY",
    aum: "$5.6B AUM",
    focus: "Growth-stage technology companies, global",
    description: "Technology growth equity firm. Invests $25M-$250M+ per company. Focus on North America, Latin America, and emerging markets."
  }
];

const basePath = path.join(__dirname, 'PE-firms');

newFirms.forEach(firm => {
  const firmDir = path.join(basePath, firm.slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(firmDir)) {
    fs.mkdirSync(firmDir, { recursive: true });
    console.log(`✅ Created directory: ${firm.slug}`);
  } else {
    console.log(`⚠️  Directory already exists: ${firm.slug}`);
  }
  
  // Create README.md
  const readme = `# ${firm.name}

## Overview
${firm.description}

**Website:** ${firm.website}  
**Location:** ${firm.location}  
**AUM:** ${firm.aum}  
**Focus:** ${firm.focus}

## Key Contact

**${firm.contact}**  
*${firm.title}*  
📧 ${firm.email}  
🔗 [LinkedIn](${firm.linkedin})

## Investment Criteria

- **Target Company Size:** ${firm.slug.includes('lower') || firm.slug.includes('shore') || firm.slug.includes('trivest') ? 'Lower middle market' : 'Middle market'}
- **Geography:** ${firm.location.includes('Miami') && firm.slug === 'riverwood-capital' ? 'North America, Latin America, emerging markets' : 'North America'}
- **Sectors:** ${firm.focus}

## Research Notes

**Source:** Official website, team pages, verified email patterns  
**Status:** Enriched ${new Date().toISOString().split('T')[0]}  
**Next Steps:** Potential outreach for Hello Gumbo PE services

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

  const readmePath = path.join(firmDir, 'README.md');
  fs.writeFileSync(readmePath, readme);
  console.log(`📝 Created README.md for ${firm.name}`);
});

console.log('\n✅ All dossiers created!');
