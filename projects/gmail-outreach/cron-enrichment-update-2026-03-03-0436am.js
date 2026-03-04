const { google } = require('googleapis');

const updates = [
  {
    row: 310,
    company: "Argonaut Private Equity",
    contact: "Anil Khatod",
    title: "Senior Partner & Managing Director",
    email: "anilk@argonautpe.com",
    linkedin: "https://www.linkedin.com/in/anilkhatod/",
    status: "Enriched",
    notes: "Email verified via ContactOut. Sits on boards of SamCart, Monavate, Achronix Semiconductor. Source: ContactOut 2026-03-03"
  },
  {
    row: 220,
    company: "WindPoint Partners",
    contact: "Nathan Brown",
    title: "Managing Director",
    email: "nbrown@wppartners.com",
    linkedin: "https://www.linkedin.com/in/nathan-brown-82bb71169/",
    status: "Enriched",
    notes: "Email pattern from RocketReach. Joined 1997, serves on boards of Central Moloney, Envera, Pavion, Vertex, Voyant Beauty. Source: WindPoint website + RocketReach 2026-03-03"
  },
  {
    row: 234,
    company: "The Jordan Company (TJC)",
    contact: "Mark Emery",
    title: "Partner, Co-Head of Operations Management Group",
    email: "memery@tjclp.com",
    linkedin: "https://www.linkedin.com/in/mark-emery-59bb52b5/",
    status: "Enriched",
    notes: "Email pattern from RocketReach. Exec Committee member, joined 2008, ex-CEO Northstar Aerospace. Source: TJC website + RocketReach 2026-03-03"
  },
  {
    row: 510,
    company: "Edgewater Capital Partners",
    contact: "Christopher Childres",
    title: "Managing Partner and Founder",
    email: "cchildres@edgewatercapital.com",
    linkedin: "https://www.linkedin.com/company/edgewater-capital-partners",
    status: "Enriched",
    notes: "Email pattern from ZoomInfo. 25+ years PE experience, specialty industrials and life sciences focus. Cleveland-based. Alt contact: Bob Girton, Managing Partner, rgirton@edgewatercapital.com. Source: Edgewater website + ZoomInfo 2026-03-03"
  },
  {
    row: 511,
    company: "Emerging Capital Partners - ECP",
    contact: "Michael Jansa",
    title: "Managing Director",
    email: "jansa@ecpinvestments.com",
    linkedin: "https://theorg.com/org/emerging-capital-partners-ecp/org-chart/michael-jansa",
    status: "Enriched",
    notes: "Email pattern from Wiza. Extensive finance background, ex-GE Capital, Union Pacific. Africa-focused PE. Source: Wiza + TheOrg 2026-03-03"
  },
  {
    row: 531,
    company: "Peninsula Capital Partners L.L.C.",
    contact: "David Ho",
    title: "Managing Director",
    email: "dho@peninsulafunds.com",
    linkedin: "https://www.linkedin.com/in/david-ho-ba20917",
    status: "Enriched",
    notes: "Email domain from ZoomInfo. Detroit-based. Source: ZoomInfo 2026-03-03"
  },
  {
    row: 535,
    company: "RA Capital Management",
    contact: "Andrew Levin",
    title: "Partner and Managing Director",
    email: "alevin@racap.com",
    linkedin: "https://www.linkedin.com/in/andrew-levin",
    status: "Enriched",
    notes: "Biotech/healthcare PE. Co-Founder Climb Bio, ex-Eliem CEO. MD/PhD, drug discovery focus. Source: RA Capital website + Crunchbase 2026-03-03"
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  console.log(`Updating ${updates.length} rows...`);
  
  for (const update of updates) {
    const range = `Sheet1!B${update.row}:J${update.row}`;
    const values = [[
      update.contact,
      update.title,
      update.email,
      '', // website (keep existing)
      update.linkedin,
      '', // sector focus (keep existing)
      '', // portfolio (keep existing)
      update.status,
      '' // last contacted (keep existing)
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Row ${update.row}: ${update.company} - ${update.contact}`);
    } catch (error) {
      console.error(`✗ Row ${update.row}: ${error.message}`);
    }
  }

  console.log('\nEnrichment complete!');
  console.log(`Enriched: ${updates.length} firms`);
  console.log('Status: Research-only, no emails sent');
}

updateSheet().catch(console.error);
