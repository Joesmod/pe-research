const {google} = require('googleapis');
const {JWT} = require('google-auth-library');
const creds = require('./service-account.json');

async function main() {
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({version:'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // 20 new PE/growth equity firms - mid-market, services-heavy focus
  const newLeads = [
    ["Trive Capital", "Conner Searcy", "Managing Partner", "", "https://www.trivecapital.com", "https://www.linkedin.com/company/trive-capital", "Business Services, Industrial Services, Healthcare", "Multiple mid-market services companies", "New", "", "Dallas-based, has dedicated Operating Partners team, Bain & Co alumni founders"],
    ["Sun Capital Partners", "Marc Leder", "Co-CEO & Co-Founder", "", "https://suncappart.com", "https://www.linkedin.com/company/sun-capital-partners", "Business Services, Consumer, Industrial, Healthcare", "550+ portfolio companies, Anderson Business Advisors, Cotton Holdings", "New", "", "Global PE, strong Operating Partners team with Sun Transformation System, Boca Raton"],
    ["Comvest Partners", "Michael Falk", "Co-Founder & Senior Advisor", "", "https://comvest.com", "https://www.linkedin.com/company/comvest-partners", "Business Services, Healthcare, Industrial, Technology", "$9B+ invested capital, middle-market focus", "New", "", "West Palm Beach, dedicated Operating Advisory Group (OAG) for value creation"],
    ["Levine Leichtman Capital Partners", "Lauren Leichtman", "Co-Founder & President", "", "https://www.llcp.com", "https://www.linkedin.com/company/levine-leichtman-capital-partners", "Business Services, Franchising, Education & Training", "Signature Resolution, Expert Institute, ALL4, Zero100", "New", "", "Beverly Hills, $3.6B Fund VII, structured PE approach, Inc Founder-Friendly list"],
    ["Pfingsten Partners", "Scott Finegan", "Senior Managing Director", "", "https://pfingsten.com", "https://www.linkedin.com/company/pfingsten-partners", "Business Services, Industrial, Distribution", "Mid-market services companies", "New", "", "Chicago, Top 50 PE Middle Market 10 consecutive years, has Operations Team (Ken Hessevick MD)"],
    ["Capstreet", "Not identified", "N/A", "", "https://capstreet.com", "https://www.linkedin.com/company/the-capstreet-group", "Software, Tech-Enabled Services, Industrial Business Services", "Surgical Notes, Ontellus (sold to Datavant)", "New", "", "Houston, 1990 founding, Capvalue Framework for value creation, Top 50 PE Middle Market 2026"],
    ["Alpine Investors", "Graham Weaver", "CEO & Founder", "", "https://www.alpineinvestors.com", "https://www.linkedin.com/company/alpine-investors", "Business Services, Software, Healthcare Services", "Multiple services platforms", "New", "", "San Francisco, PeopleFirst approach, known for CEO-in-Training program, ~$5B AUM"],
    ["Trivest Partners", "Troy Templeton", "Managing Partner", "", "https://www.trivest.com", "https://www.linkedin.com/company/trivest-partners", "Business Services, Consumer, Distribution, Healthcare", "Founder/family-owned businesses", "New", "", "Coral Gables FL, 40 years, Path to 3x value creation methodology"],
    ["O2 Investment Partners", "Not identified", "N/A", "", "https://www.o2investment.com", "https://www.linkedin.com/company/o2-investment-partners", "Business Services, Healthcare Services, Industrial Services", "Environmental Infrastructure Solutions (sold to Sun Capital)", "New", "", "Detroit, lower mid-market, services-focused"],
    ["Keltic Financial Partners", "Not identified", "N/A", "", "https://www.kelticfp.com", "https://www.linkedin.com/company/keltic-financial-partners", "Business Services, Healthcare, Staffing", "Mid-market services companies", "New", "", "NY-based, mid-market focus on services-heavy industries"],
    ["Angeles Equity Partners", "Not identified", "N/A", "", "https://www.angelesequity.com", "https://www.linkedin.com/company/angeles-equity-partners", "Business Services, Industrial Services, Distribution", "Mid-market operations-intensive businesses", "New", "", "Los Angeles, operationally-oriented PE, targets $30-200M revenue companies"],
    ["CM Equity Partners", "Not identified", "N/A", "", "https://www.cmequity.com", "https://www.linkedin.com/company/cm-equity-partners", "Business Services, Healthcare Services, Professional Services", "Mid-market services companies", "New", "", "New York, lower mid-market services focus"],
    ["Sound Growth Partners", "Not identified", "N/A", "", "https://www.soundgrowthpartners.com", "https://www.linkedin.com/company/sound-growth-partners", "Business Services, Professional Services", "Mid-market services platforms", "New", "", "Edmonds WA, mid-market PE with services sector focus"],
    ["Broadwing Capital", "Not identified", "N/A", "", "https://www.broadwingcapital.com", "https://www.linkedin.com/company/broadwing-capital", "Business Services, Professional Services, Insurance Services", "Mid-market services companies", "New", "", "Dallas, mid-market PE focused on services and distribution"],
    ["RFE Investment Partners", "Not identified", "N/A", "", "https://www.rfeip.com", "https://www.linkedin.com/company/rfe-investment-partners", "Business Services, Healthcare Services, Industrial Services", "Lower mid-market services companies", "New", "", "New Canaan CT, lower mid-market buyouts, services-heavy portfolio"],
    ["Tonka Bay Equity Partners", "Not identified", "N/A", "", "https://www.tonkabayequity.com", "https://www.linkedin.com/company/tonka-bay-equity-partners", "Business Services, Healthcare Services, Staffing", "Lower mid-market services businesses", "New", "", "Minneapolis, lower mid-market, services and healthcare services focus"],
    ["Centerbridge Partners", "Jeffrey Aronson", "Co-Founder & Managing Principal", "", "https://www.centerbridge.com", "https://www.linkedin.com/company/centerbridge-partners", "Business Services, Financial Services, Healthcare", "Multi-billion AUM, diversified services portfolio", "New", "", "New York, ~$34B AUM, strong value creation focus across services"],
    ["Platinum Equity", "Tom Gores", "Founder, Chairman & CEO", "", "https://www.platinumequity.com", "https://www.linkedin.com/company/platinum-equity", "Business Services, Industrial Services, Distribution, BPO", "550+ acquisitions including services companies", "New", "", "Beverly Hills, M&A&O approach (Mergers Acquisitions & Operations), strong ops team"],
    ["Vector Capital", "Alex Slusky", "Founder & CIO", "", "https://www.vectorcapital.com", "https://www.linkedin.com/company/vector-capital", "Technology Services, Business Services, IT Services", "Tech-enabled services companies", "New", "", "San Francisco, mid-market tech & tech-enabled services, operational value creation"],
    ["Crestview Partners", "Barry Volpert", "Co-Founder & Managing Partner", "", "https://www.crestview.com", "https://www.linkedin.com/company/crestview-partners", "Business Services, Financial Services, Healthcare, Media", "Services-heavy portfolio companies", "New", "", "New York, mid-market PE, strong focus on services industries and operational improvement"],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:K',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: newLeads },
  });

  console.log(`Added ${newLeads.length} new PE firm leads to the sheet.`);
}

main().catch(e => console.error(e.message));
