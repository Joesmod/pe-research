const path = require('path');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Score 9 contact bios scraped from company team pages
const bios = {
  // JLL Partners - row 2-8 (team page confirms titles, bios behind JS modal)
  2: "CTO at JLL Partners. Team page confirms role. JLL has Chief AI Officer (Jeff Hunter) and integrated ops/tech team. Firm focuses on middle-market buyouts with in-house operational support. Source: jllpartners.com/team",
  3: "Managing Director at JLL Partners. Team page confirmed. Firm has fully integrated investment, operational, BD and capital markets professionals. Source: jllpartners.com/team",
  4: "Managing Director at JLL Partners. Team page confirmed. Source: jllpartners.com/team",
  5: "Managing Director at JLL Partners. Team page confirmed. Source: jllpartners.com/team",
  6: "Managing Director - Capital Markets at JLL Partners (title update from team page). Source: jllpartners.com/team",
  7: "Principal at JLL Partners. Team page confirmed. Source: jllpartners.com/team",
  8: "Chief AI Officer at JLL Partners (title update - was listed as Advisor in Apollo). KEY CONTACT - firm already has dedicated AI leadership. Source: jllpartners.com/team",

  // Greater Sum Ventures - rows 9-17
  9: "VP Business Development at GSV. Not found on current team page - may have departed. Source: greatersumventures.com/team",
  10: "Co-Founder & Managing Partner at GSV. Seasoned operator, investor, deal architect. Former founder of E-Zekiel LMS (10K+ orgs), merged with Ministry Brands 2013. CFO of Ministry Brands leading 30+ acquisitions. Focus: founder-led businesses, recurring revenue, SaaS roll-ups. Source: greatersumventures.com/team/bill-nix",
  11: "CTO/CIO/CSO at GSV. Not found on current team page - may use different URL or have departed. Source: greatersumventures.com/team",
  12: "VP Product & Technology at GSV. 22+ yrs building/scaling software. Founded company acquired by Ministry Brands 2014, became Chief Product Officer. Leads product/tech/ops/GTM alignment for portfolio cos. Former founder. Source: greatersumventures.com/team/brian-seagraves",
  13: "Principal & Operating Partner at GSV. Former NFL linebacker turned founder. 19 yrs operating exp, 6 patents. VP Strategic Partnerships at GRIDSMART (acquired by Cubic Corp 2019). Focus: sales performance, pricing, channel partnerships. Source: greatersumventures.com/team/will-overstreet",
  14: "VP IT Security & Compliance at GSV. 35+ yrs experience, multiple security certs. Six-time founder/co-founder with 4 exits. Former CIO/CISO. Focus: infosec, compliance, scaling security for portfolio cos. Source: greatersumventures.com/team/ken-clegg",
  15: "Managing Director & Operating Partner at GSV. 20+ yrs financial ops and growth strategy. CFO of Ministry Brands (exited $1.4B) and Inhabit (sold $3B in 2024). 25+ recapitalizations. $200M+ EBITDA improvements in healthcare. Source: greatersumventures.com/team/mike-stephens",
  16: "VP Payments & Operating Partner at GSV. 3x founder, 18+ yrs in software/payments/SaaS. Co-founded SimpleGive (1st Ministry Brands acquisition). Former CTO then Chief Payments Officer at Ministry Brands. BS CompSci + MBA. Source: greatersumventures.com/team/jason-butler",
  17: "Managing Director & Head of BD at GSV (joined 2025). Previously led BD at Susquehanna Growth Equity and Riverside Acceleration Capital. Focus: vertical software, founder-first investing, systems of record near payments. Source: greatersumventures.com/team/max-chautin",

  // Knox Capital - rows 18-27 (website expired)
  18: "Knox Capital website expired (Squarespace). No public team page available.",
  19: "Knox Capital website expired. No public bio available.",
  20: "Knox Capital website expired. No public bio available.",
  21: "Knox Capital website expired. No public bio available.",
  22: "Knox Capital website expired. No public bio available.",
  23: "Knox Capital website expired. No public bio available.",
  24: "Knox Capital website expired. No public bio available.",
  25: "Knox Capital website expired. No public bio available.",
  26: "Knox Capital website expired. No public bio available.",
  27: "Knox Capital website expired. No public bio available.",

  // Huron Capital - rows 28-36
  28: "VP Head of BD & ExecFactor at Huron Capital. Team page at huroncapital.com/team (individual bios available). Source: huroncapital.com",
  29: "Partner at Huron Capital. Source: huroncapital.com/team",
  30: "Operating Partner at Huron Capital. Source: huroncapital.com/team",
  31: "Operating Partner at Huron Capital. Source: huroncapital.com/team",
  32: "Founding Partner at Huron Capital. Responsible for deal sourcing, portfolio dev, board representation. Investment Committee & Board member. Prior: VP & Treasurer at Penske Corp (transport, logistics, manufacturing, motorsports). Senior roles at Nesbitt Burns Securities (Bank of Montreal) and Northern Trust. Source: huroncapital.com/team/peter-mogk",
  33: "Operating Partner at Huron Capital. Source: huroncapital.com/team",
  34: "Operating Partner at Huron Capital. Source: huroncapital.com/team",
  35: "Operating Partner at Huron Capital. Source: huroncapital.com/team",
  36: "Partner - Resource Group at Huron Capital. Source: huroncapital.com/team",

  // Roark - row 37 (no contact name in CRM)
  37: "Roark Capital Group - rich team page with full bios and emails. Founder: Neal Aronson. ~100+ team members listed. Focus: franchise/multi-unit, restaurant, health/wellness, business services, education. Has Software Engineer on staff. Source: roarkcapital.com/ourteam",

  // Kohlberg - row 38 (no contact name in CRM)
  38: "Kohlberg & Company - ~100 person team. Managing Partner: Samuel Frieder, CIO: Gordon Woodward. Has Operating Executive for AI & Data (Michael Bogobowicz) and CTO (Moira O'Reilly). KEY: Firm already investing in AI/data capabilities. 7 Operating Partners + 10 Operating Executives. Source: kohlberg.com/our-team",

  // Renovus Capital - rows 39-47
  39: "Managing Director at Renovus, Investment Team, Technology Services vertical. Prior: Principal at Norwest Equity Partners, Associate at Graham Partners. Started at Deutsche Bank M&A. Edu: MBA UPenn, BBA Michigan. Source: renovuscapital.com/team-member/jason-tanker",
  40: "Managing Director at Renovus. Source: renovuscapital.com/our-team (individual bio page not found)",
  41: "Managing Director at Renovus. Source: renovuscapital.com/our-team",
  42: "Principal at Renovus. Source: renovuscapital.com/our-team",
  43: "Principal at Renovus. Source: renovuscapital.com/our-team",
  44: "Principal at Renovus. Source: renovuscapital.com/our-team",
  45: "Partner at Renovus. Source: renovuscapital.com/our-team (individual bio not found for billy-landman)",
  46: "Partner at Renovus. Deal origination, execution, portfolio mgmt. Prior: MD at Focus Investment Banking (govt, aerospace, defense, IT sectors). Founded 3 startups in software/IT consulting. Former Principal at Cap Gemini (ERP, supply chain, app dev). Edu: MS Mech Eng Maryland, BS Gujarat Univ. Source: renovuscapital.com/team-member/manan-shah",
  47: "Founding Partner at Renovus. Individual bio page not found (may be listed as different slug). Source: renovuscapital.com/our-team",

  // Diversis - row 48 (no contact)
  48: "Diversis Capital - Software-focused PE firm. Partners with tech companies to accelerate growth. Operational PE with software-specific resources. Flexible deal structures. Portfolio includes BLUE Software, ServicePower. Source: diversis.com",

  // Apax - row 49 (no contact)
  49: "Apax Partners - Global PE firm. Sectors: Tech, Services, Internet/Consumer. Strategies: Global Buyout, Digital Growth, Global Impact, Mid-Market Israel, Credit. Has dedicated Operational Excellence team. Offices: NYC, London, Munich, Mumbai, Hong Kong, Shanghai, Tel Aviv, Abu Dhabi. Source: apax.com",

  // Waud Capital - rows 50-59
  50: "Founder & Managing Partner of Waud Capital. 500+ company acquisitions over career. Prior: GTCR (PE), Salomon Brothers (VC). Board: Northwestern Memorial, Art Institute of Chicago, Chairman of Acadia Healthcare. Edu: BA Econ Middlebury, MBA Kellogg Northwestern. Source: waudcapital.com/team/reeve-waud",
  51: "Principal at Waud Capital. Source: waudcapital.com/team (JS-rendered, individual bios available)",
  52: "Partner at Waud Capital. Source: waudcapital.com/team",
  53: "Principal at Waud Capital. Source: waudcapital.com/team",
  54: "Partner at Waud Capital. Source: waudcapital.com/team",
  55: "Partner at Waud Capital. Source: waudcapital.com/team",
  56: "Partner at Waud Capital. Source: waudcapital.com/team",
  57: "Operating Partner at Waud Capital. Source: waudcapital.com/team",
  58: "Executive Partner at Waud Capital. Source: waudcapital.com/team",
  59: "Principal: Software & Technology at Waud Capital. KEY CONTACT - dedicated software/tech role. Source: waudcapital.com/team",

  // Comvest - rows 60-69
  60: "VP Business Development at Comvest (Manulife | Comvest Credit Partners). Individual bio not found - may be newer hire. Source: comvest.com",
  61: "Managing Director at Comvest. Investor relations, formerly Goldman Sachs Alternatives (VP), Neuberger Berman (MD), TD Cowen (MD). Edu: MBA Columbia Business School, BA Intl Relations UPenn (summa cum laude). Source: comvest.com/team-members/itai-baron",
  62: "Managing Director at Comvest. Healthcare + other sectors, direct lending & opportunistic credit. Prior: Capital One/GE Capital (MD Sponsor Originations), PwC. Edu: MBA Kellogg Northwestern, MS Accountancy + BS Finance Indiana. Source: comvest.com/team-members/kevin-blitz",
  63: "Managing Director at Comvest. Source: comvest.com/team-members",
  64: "Managing Director at Comvest. Source: comvest.com/team-members",
  65: "Managing Director at Comvest. Source: comvest.com/team-members",
  66: "Managing Director at Comvest. Source: comvest.com/team-members",
  67: "Managing Director at Comvest. Source: comvest.com/team-members",
  68: "Principal at Comvest. Source: comvest.com/team-members",
  69: "Principal & Deputy Operations Officer at Comvest (title update from team page). Source: comvest.com/team-members",

  // Bertram Capital - rows 70-78
  70: "Principal at Bertram Capital. Firm has in-house tech team (Bertram Labs) with product strategists, software engineers, designers, marketers. KEY: Built-in tech enablement capability. Source: bertramcapital.com/team",
  71: "Principal at Bertram Capital. Source: bertramcapital.com/team",
  72: "Partner at Bertram Capital. Source: bertramcapital.com/team",
  73: "Partner at Bertram Capital. Source: bertramcapital.com/team",
  74: "Partner at Bertram Capital. Source: bertramcapital.com/team",
  75: "Duplicate entry (company name as contact). Bertram Capital partner list on website. Source: bertramcapital.com/team",
  76: "Partner at Bertram Capital. Source: bertramcapital.com/team",
  77: "Managing Partner at Bertram Capital. Source: bertramcapital.com/team",
  78: "Vice President at Bertram Capital. Source: bertramcapital.com/team",

  // Revelstoke - rows 79-88
  79: "Founder & Managing Partner at Revelstoke. Chairman of Executive & Investment Committees. 25 yrs PE/IB experience. Prior: MD at Eos Partners (NYC), PE at KRG Capital (Denver), M&A at Credit Suisse First Boston. Board experience across public & private cos. Advisory board Burridge Center for Finance (CU Boulder). Source: revelstokecapital.com/team/simon-bachleda",
  80: "Managing Director, Strategy & Operations (Portfolio Transformation Group) at Revelstoke. Prior: Manager at Deloitte Consulting Healthcare & Life Sciences Strategy (7 yrs). Focus: growth initiatives, process improvement, clinical ops, margin improvement, operating model design. Source: revelstokecapital.com/team/tom-fagan",
  81: "Principal at Revelstoke, Investment Team. Source: revelstokecapital.com/team",
  82: "Principal at Revelstoke. Source: revelstokecapital.com/team",
  83: "Principal, Board Member at Revelstoke. Source: revelstokecapital.com/team",
  84: "Partner at Revelstoke, Investment Team. Member of Investment & Executive Committees. Oversight: Valuation Committee, portfolio analytics, investment themes, BD. Prior: M&A at Morgan Stanley, Strategy & Ops at Deloitte Consulting (supply chain, logistics). Source: revelstokecapital.com/team/andrew-welch",
  85: "Partner at Revelstoke, Investment Team. Prior: MD at New Mountain Capital (PE), 7+ yrs at Vestar Capital (healthcare PE), IB at Bank of America Merrill Lynch (tech & business services). Source: revelstokecapital.com/team/matt-dubbioso",
  86: "Partner at Revelstoke, Investment Team. Member of Investment & Executive Committees. Oversight: PTG, hiring, performance, internal ops. Prior: Healthcare M&A at Jefferies (vet services, physician practice mgmt, pharma services, behavioral health). Source: revelstokecapital.com/team/anthony-hayes",
  87: "Managing Director, Strategic Partnerships & Value Creation at Revelstoke (joined 2025). Prior: Associate Partner at McKinsey (PE procurement value capture), Army Engineer Officer (Iraq infrastructure, Peru counternarcotics), Amazon ops strategy fellow. Source: revelstokecapital.com/team/andrew-thoma",
  88: "Operating Partner at Revelstoke. Individual bio page not found. Source: revelstokecapital.com/team"
};

(async () => {
  const batch = Object.entries(bios).map(([row, note]) => ({
    range: `Contacts!H${row}`,
    values: [[note]]
  }));
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: batch }
  });
  
  console.log(`Pushed ${batch.length} research notes to CRM (rows 2-88, all Score 9 contacts)`);
})();
