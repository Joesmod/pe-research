const { google } = require('googleapis');

const updates = [
  {
    row: 581,
    values: [
      "Centiva Capital",
      "https://www.centivacapital.com",
      "Edward McBride",
      "Co-Founder & Chief Investment Officer",
      "edward.mcbride@centivacapital.com",
      "https://www.centivacapital.com",
      "https://www.linkedin.com/in/edward-mcbride-9015931/",
      "",
      "",
      "Enriched",
      "Multi-strategy hedge fund. Contact verified via LinkedIn and Preqin. Founded 2016 by Karim Abbadi and Edward McBride. [2026-03-25 cron]",
      "Hedge fund, not traditional PE",
      "https://www.preqin.com/data/profile/fund-manager/centiva-capital/200275",
      ""
    ]
  },
  {
    row: 592,
    values: [
      "District Partners",
      "https://districtpartnersllc.com",
      "Kevin Gerrity",
      "Managing Partner",
      "kevin@districtpartnersllc.com",
      "https://districtpartnersllc.com",
      "https://www.linkedin.com/in/kevin-gerrity/",
      "",
      "",
      "Dead - Not PE Firm",
      "Executive search/recruiting firm for PE/VC, NOT an investment firm. [2026-03-25 cron]",
      "Recruiting firm serving PE clients",
      "https://districtpartnersllc.com/about/",
      ""
    ]
  },
  {
    row: 593,
    values: [
      "Drake Star",
      "https://www.drakestar.com",
      "Jim Holzer",
      "Managing Partner",
      "Jim.Holzer@drakestar.com",
      "https://www.drakestar.com",
      "https://www.linkedin.com/company/drake-star",
      "",
      "",
      "Dead - Not PE Firm",
      "M&A advisory and corporate finance for tech/media sectors. NOT a PE investor. [2026-03-25 cron]",
      "M&A advisory, not PE",
      "https://www.drakestar.com/",
      ""
    ]
  },
  {
    row: 603,
    values: [
      "Erez Capital",
      "https://www.erezcapital.io",
      "Michael Benezra",
      "Managing Partner & Founder",
      "",
      "https://www.erezcapital.io",
      "https://www.linkedin.com/company/erez-capital",
      "",
      "",
      "Enriched",
      "Early-stage VC in Boston investing in pre-seed startups. Founded 2022. No direct email publicly available. Also: Arpit Garg (General Partner). [2026-03-25 cron]",
      "Too small for target (early-stage VC, not mid-market PE)",
      "https://www.linkedin.com/company/erez-capital",
      ""
    ]
  },
  {
    row: 598,
    values: [
      "Eckuity Capital",
      "https://www.eckuity.com",
      "Vishal Jain",
      "Founder and Managing Partner",
      "vishal.jain@eckuity.com",
      "https://www.eckuity.com",
      "https://www.linkedin.com/in/vishal-jain-a404151/",
      "",
      "",
      "Enriched",
      "Healthcare-focused PE/VC. Email pattern verified via Apollo. Entrepreneur and investor in healthcare and technology. [2026-03-25 cron]",
      "Healthcare PE/VC",
      "https://www.linkedin.com/in/vishal-jain-a404151/",
      ""
    ]
  },
  {
    row: 600,
    values: [
      "EdgeCase Capital Partners",
      "https://edgecasecap.com",
      "Jason Moskowitz",
      "Partner",
      "jason@edgecasecap.com",
      "https://edgecasecap.com",
      "https://www.linkedin.com/in/jason-moskowitz/",
      "",
      "",
      "Enriched",
      "Email pattern verified. Partner at EdgeCase Capital Partners. [2026-03-25 cron]",
      "Needs verification if mid-market PE",
      "",
      ""
    ]
  },
  {
    row: 602,
    values: [
      "EquityZen",
      "https://equityzen.com",
      "Phil Haslett",
      "Founder & Chief Strategy Officer",
      "phil@equityzen.com",
      "https://equityzen.com",
      "https://www.linkedin.com/in/philhaslett/",
      "",
      "",
      "Dead - Not PE Firm",
      "Secondary market platform for private company shares. NOT a PE investor. [2026-03-25 cron]",
      "Platform/marketplace, not PE",
      "https://equityzen.com",
      ""
    ]
  },
  {
    row: 607,
    values: [
      "Flyover Capital",
      "http://www.flyovercapital.com",
      "Patrick Berry",
      "Principal",
      "pberry@flyovercapital.com",
      "http://www.flyovercapital.com",
      "https://www.linkedin.com/in/patrick-berry-flyover/",
      "",
      "",
      "Enriched",
      "Early-stage VC focused on Midwest startups. Email pattern verified. [2026-03-25 cron]",
      "VC firm, not mid-market PE",
      "http://www.flyovercapital.com",
      ""
    ]
  },
  {
    row: 609,
    values: [
      "Further Global Capital Management",
      "http://www.furtherglobal.com",
      "Susan Ciccarone",
      "Partner",
      "ciccarone@furtherglobal.com",
      "http://www.furtherglobal.com",
      "https://www.linkedin.com/in/susan-ciccarone/",
      "",
      "",
      "Enriched",
      "Email pattern verified. Partner at Further Global Capital Management. [2026-03-25 cron]",
      "Needs verification of firm type and size",
      "",
      ""
    ]
  },
  {
    row: 610,
    values: [
      "Garden City Equity",
      "http://www.gardencityequity.com",
      "Michael Arrieta",
      "Partner",
      "mike@gardencityequity.com",
      "http://www.gardencityequity.com",
      "https://www.linkedin.com/in/michael-arrieta/",
      "",
      "",
      "Enriched",
      "Email pattern verified. Contact at Garden City Equity. [2026-03-25 cron]",
      "Needs verification of firm type and size",
      "",
      ""
    ]
  }
];

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    console.log(`Updating row ${update.row}: ${update.values[0]}...`);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: `Sheet1!A${update.row}:N${update.row}`,
      valueInputOption: 'RAW',
      resource: { values: [update.values] },
    });
    
    console.log(`✓ Updated row ${update.row}`);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n✓ Successfully updated ${updates.length} rows`);
}

run().catch(console.error);
