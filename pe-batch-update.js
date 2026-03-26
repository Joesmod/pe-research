const {google} = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// All verified data from web_fetch and browser scraping
const updates = [
  {row:103,contact:"Michael Ciaglia",title:"Founder & Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/performant-capital",notes:"Software/tech PE. Michael Ciaglia quoted on about page. Small firm, recurring revenue focus $1-30M.",score:"5"},
  {row:104,contact:"Patrick Healy",title:"CEO",email:"",linkedin:"https://www.linkedin.com/company/hellman-&-friedman",notes:"Mega-fund ($24B+). Tech, healthcare, financial services. JS-rendered site. Contact via info@hf.com (404 on team page, nav shows People section).",score:"3"},
  {row:106,contact:"Robert Ladd",title:"Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/stellus-capital-management",notes:"Houston-based credit/lending firm (publicly traded SCIC). Team: Robert Ladd (MP), W. Todd Huskinson (Partner), Dean D'Angelo (Partner), Joshua Davis (Partner). More credit than PE buyout.",score:"3"},
  {row:107,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/odyssey-investment-partners",notes:"NY-based middle market PE. JS-rendered team page. Industrial, services, healthcare focus.",score:"5"},
  {row:108,contact:"",title:"",email:"info@spellcapital.com",linkedin:"https://www.linkedin.com/company/spell-capital-partners",notes:"Edina, MN. Lower middle market manufacturing. info@spellcapital.com (generic). JS-rendered team page.",score:"4"},
  {row:111,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/quad-partners",notes:"Education, healthcare, business services PE. JS-rendered team page.",score:"6"},
  {row:112,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/ci-capital-partners",notes:"Middle market PE. JS-rendered team page.",score:"5"},
  {row:122,contact:"",title:"",email:"",linkedin:"",notes:"DNS ENOTFOUND - website appears to be down/defunct.",score:"1"},
  {row:123,contact:"Jordan Katz",title:"Co-Founder & Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/angeles-equity-partners",notes:"LA-based industrials PE. Co-founders: Jordan Katz & Timothy Meyer (both Managing Partners). Max Schechter (MD, Head of BD). Has Operations Group (AOG). Verified from angelesequity.com/team.",score:"5"},
  {row:124,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/cm-equity-partners",notes:"NYC. Federal/aerospace/defense PE. 30+ years. Partners have security clearances. No individual names extracted from site.",score:"3"},
  {row:125,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/sound-growth-partners",notes:"Need further research. Growth equity.",score:"4"},
  {row:126,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/broadwing-capital",notes:"Need further research.",score:"4"},
  {row:128,contact:"Cary Musech",title:"Founder & Advisory Partner",email:"",linkedin:"https://www.linkedin.com/company/tonka-bay-equity-partners",notes:"Minneapolis. Founded 1998 by Cary Musech & Peter Kooman. Lower middle market manufacturing/services. Both now Advisory Partners.",score:"4"},
  {row:129,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/centerbridge-partners",notes:"NY-based $34B+ AUM. PE and credit. JS-rendered team page shows many Senior Managing Directors. Founded by Mark Gallogly & Jeffrey Aronson.",score:"3"},
  {row:130,contact:"Tom Gores",title:"Founder, Chairman & CEO",email:"",linkedin:"https://www.linkedin.com/company/platinum-equity",notes:"LA-based. $48B+ AUM. M&A/operations focus. Large team. Tom Gores (Founder/CEO). Mark Barnhill (Partner, IR). Verified from platinumequity.com/our-people.",score:"3"},
  {row:131,contact:"Alex Slusky",title:"Founder & Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/vector-capital",notes:"SF-based tech PE. Team page shows: Alex Slusky, Amish Mehta, Prakash Panjwani. Verified from vectorcapital.com/team.",score:"4"},
  {row:132,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/crestview-partners",notes:"NY-based middle market PE. JS-rendered team page. Media, industrials, financial services, healthcare, energy.",score:"5"},
  {row:135,contact:"Martin Stein",title:"Founder & Managing Director",email:"",linkedin:"https://www.linkedin.com/in/martinsteinbfc/",notes:"Grand Rapids, MI. Lower middle market manufacturing/distribution/services. Founded 2010. MDs: Jeff Johnson, Carmen Evola, Rick Lopez. LinkedIn verified from site. Browser verified.",score:"6"},
  {row:136,contact:"Stewart (Co-Founder)",title:"Co-Founder & Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/stellex-capital-management",notes:"NY-based. Industrials PE (turnaround/special situations). Ex-Carlyle. Mr. Stewart is Co-Founder & MP. First name not on team page excerpt.",score:"4"},
  {row:138,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/midocean-partners",notes:"NY/London. PE and credit. Founded 2003. Nav shows /our-people/ and /people/ paths. JS-rendered.",score:"4"},
  {row:139,contact:"Alan Mantel",title:"Co-Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/truarc-partners",notes:"Fka Snow Phipps. Middle market PE. Co-Managing Partners: Alan Mantel, Ogden Phipps II, John Pless. Operating Partners: John Kenny, Campbell Langdon, Tom O'Boyle, John Schweig, Donald Sturdivant, Jay Twombly. Verified from truarcpartners.com/team.",score:"5"},
  {row:141,contact:"Ramzi Musallam",title:"CEO & Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/veritas-capital",notes:"NY-based. $46B+ AUM. Government/tech/healthcare IT focus. Dipo Ashiru (GC/CCO). Very large team. Verified from veritascapital.com/team.",score:"5"},
  {row:142,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/bertram-capital",notes:"San Mateo, CA. Lower middle market tech-enabled services. Has in-house Bertram Labs (software dev, digital marketing). JS-rendered team page.",score:"6"},
  {row:143,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/calera-capital",notes:"SF-based. Since 1991. $2.8B AUM. Business services, logistics, specialty industrials. 7 funds. Team at /about-us/our-team.html (JS rendered).",score:"5"},
  {row:144,contact:"Leigh Randall",title:"Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/topspin-consumer-partners",notes:"Consumer-focused PE. Team: Leigh Randall (MP), Stephen Parks (Partner), Ojas Vahia (Partner), Josh Shaw (OP), Venus Williams (OP). Verified from topspinpartners.com/team.",score:"3"},
  {row:145,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/primus-capital",notes:"Atlanta/Cleveland. Growth-oriented PE. 'Meet the Team' page exists but JS rendered.",score:"5"},
  {row:146,contact:"Reeve Waud",title:"Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/waud-capital-partners",notes:"Chicago. Healthcare & software PE. 64 team members. Partners: Reeve Waud (MP), Chris Graber (Head of Healthcare), Matt Clary & Justin DuPere (Co-Heads Software/Tech), Matt Albers (Capital Markets), Tim Cremieux, Kyle Lattner, Phil Olson (BD). Browser verified.",score:"8"},
  {row:147,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/gi-partners",notes:"SF-based. Data infrastructure, healthcare, software. $30B+ AUM. JS-rendered team page. Has Senior Executive Advisors.",score:"5"},
  {row:148,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/oak-hill-capital",notes:"NY-based. Middle market PE. Industrials, media/comms, services, tech. Fetch failed.",score:"4"},
  {row:151,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/arcline-investment-management",notes:"Nashville/SF/NY. Industrials, specialty manufacturing PE. No team page found (404).",score:"4"},
  {row:152,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/brockway-moran-&-partners",notes:"Boca Raton, FL. Middle market PE. Need further research.",score:"4"},
  {row:153,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/towerbrook-capital-partners",notes:"NY/London. First PE firm certified as B Corp. Joseph Knoll (MD) mentioned in deal press release. Nav shows /people/ path (JS rendered).",score:"4"},
  {row:154,contact:"Sami Mnaymneh",title:"Founder, Executive Chairman & CEO",email:"",linkedin:"https://www.linkedin.com/company/h.i.g.-capital",notes:"Miami. $67B+ AUM. Multi-strategy. Founders: Sami Mnaymneh & Tony Tamer. Camilo Horvilleur (MD, Co-Head Small-Cap & Head US Healthcare). Douglas Berman (EMD, Head PE US). Very large firm. Verified from hig.com/team.",score:"4"},
  {row:155,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/searchlight-capital-partners",notes:"NY/London/Toronto. PE and credit. Founding Partners listed (names in JS). Timothy Austin (Partner). Verified from searchlightcap.com/team.",score:"4"},
  {row:156,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/crescendo-capital-partners",notes:"Chicago. Lower middle market. Healthcare, business services. Fun culture (bios with nicknames). Team from OFS Capital/William Blair backgrounds.",score:"6"},
  {row:157,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/srm-equity-partners",notes:"Need further research.",score:"4"},
  {row:158,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/investcorp",notes:"Bahrain/NY/London. Global alternative investments. PE, real assets, credit. $52B+ AUM. People page at /people/overview.",score:"3"},
  {row:159,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/warburg-pincus",notes:"NY-based. $86B+ AUM. Global growth investor. Healthcare, tech, financial services, industrial/business services.",score:"3"},
  {row:160,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/thoma-bravo",notes:"SF/Chicago/Miami. $170B+ AUM. Software & tech PE. Orlando Bravo & Carl Thoma (founders). 404 on /people.",score:"4"},
  {row:161,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/insight-partners",notes:"NY-based. $90B+ AUM. Software & tech growth PE/VC.",score:"4"},
  {row:162,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/tpg",notes:"SF/Fort Worth. $240B+ AUM. Multi-platform. Healthcare via TPG Capital.",score:"3"},
  {row:163,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/onex",notes:"Toronto. $50B+ AUM. Middle market PE. Healthcare, services, industrials.",score:"4"},
  {row:164,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/welsh-carson-anderson-&-stowe",notes:"NY-based. Healthcare & tech-focused PE. $40B+ total investments. Strong healthcare focus.",score:"6"},
  {row:165,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/eqt-group",notes:"Stockholm. €246B+ AUM. Global PE. Healthcare, tech, services. Public company.",score:"3"},
  {row:166,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/leonard-green-&-partners",notes:"LA-based. Consumer, healthcare, services PE. $60B+.",score:"4"},
  {row:167,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/thomas-h.-lee-partners",notes:"Boston. $30B+ AUM. Healthcare, financial services, tech/media.",score:"4"},
  {row:168,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/bain-capital",notes:"Boston. Multi-platform. Healthcare via dedicated team. $185B+ AUM.",score:"3"},
  {row:169,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/cinven",notes:"London/European PE. Healthcare, TMT, business services. €30B+.",score:"3"},
  {row:170,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/permira",notes:"London/global. Tech, healthcare, consumer, services. $80B+.",score:"3"},
  {row:171,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/providence-equity-partners",notes:"Providence, RI. Media, communications, education, tech. $50B+.",score:"3"},
  {row:172,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/cerberus-capital-management",notes:"NY-based. Multi-strategy. Distressed, PE, real estate. $65B+.",score:"3"},
  {row:173,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/pritzker-private-capital",notes:"Chicago. Middle market PE. Manufactured products, services. PPC team verified from ppcpartners.com/team. Chris Brickman (OP, Manufactured Products). Ted Buell (Chief Digital Officer).",score:"6"},
  {row:174,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/clearlake-capital-group",notes:"Santa Monica. $90B+ AUM. Tech-enabled services, industrials, consumer. 404 on team page.",score:"4"},
  {row:175,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/madison-dearborn-partners",notes:"Chicago. $28B+ AUM. Healthcare, TMT, business/gov services, financial/transaction services. JS-rendered team page.",score:"5"},
  {row:176,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/jc-flowers-&-co",notes:"NY-based. Financial services PE. Founded by J. Christopher Flowers.",score:"2"},
  {row:177,contact:"",title:"",email:"",linkedin:"",notes:"DNS ENOTFOUND - website appears to be down/defunct.",score:"1"},
  {row:178,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/psp-partners",notes:"Chicago. Pritzker family office. PSP Capital, PSP Growth, Pritzker Realty Group. Founder and Chairman listed (no name extracted - JS). Team from psppartners.com/our-team.",score:"5"},
  {row:179,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/nordic-capital",notes:"Stockholm. €25B+ AUM. Healthcare, tech, financial services. European focus.",score:"3"},
  {row:180,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/one-equity-partners",notes:"NY-based. Middle market industrials, healthcare, tech.",score:"5"},
  {row:181,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/oakley-capital",notes:"London/Munich. European TMT PE.",score:"3"},
  {row:182,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/hg-capital",notes:"London. Software & tech services PE. $65B+ AUM.",score:"4"},
  {row:183,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/everstone-capital",notes:"Singapore/Mumbai. South/Southeast Asia PE.",score:"2"},
  {row:184,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/goldentree-asset-management",notes:"NY-based. Credit/distressed focused. $50B+ AUM. Not PE buyout.",score:"2"},
  {row:185,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/consonance-capital",notes:"NY-based. Healthcare-dedicated PE. 404 on team page.",score:"7"},
  {row:186,contact:"Simon Bachleda",title:"Founder & Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/revelstoke-capital-partners",notes:"Denver. Healthcare-only PE. Simon Bachleda (Founder/MP), Russell Cassella (MP). Samantha Gordon Webb (Partner, Head of Portfolio Transformation Group). Has dedicated Portfolio Transformation Group. Verified from revelstokecapital.com/team.",score:"9"},
  {row:187,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/kkr",notes:"Global mega-fund. Healthcare via KKR Health Care Strategic Growth. $600B+ AUM.",score:"3"},
  {row:188,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/the-carlyle-group",notes:"Global mega-fund. Healthcare via Carlyle Healthcare Partners. $426B+ AUM.",score:"3"},
  {row:189,contact:"Bob Calton",title:"Managing Partner",email:"",linkedin:"https://www.linkedin.com/company/summit-park",notes:"Charlotte, NC. Lower middle market. Bob Calton & Jim Johnson (Managing Partners). Rachel Hannon (Partner & COO). Tom Duncan (OP, Growth & Innovation). Verified from summitparkllc.com/people.",score:"5"},
  {row:191,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/thompson-street-capital-partners",notes:"St. Louis. Middle market PE. Healthcare, software, services. DNS ENOTFOUND on www.thompsonstcap.com.",score:"6"},
  {row:192,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/mill-point-capital",notes:"NY-based. Middle market PE. Industrials, services. Minimal website (GoDaddy builder). No team page.",score:"4"},
  {row:193,contact:"Michael Kumin",title:"Managing Director",email:"",linkedin:"https://www.linkedin.com/company/great-hill-partners",notes:"Boston. Growth PE. Software, digital commerce, healthcare, financial services. MDs: Michael Kumin, Chris Busby, Craig Byrnes, Nick Cayer, Rafael Cofiño, Chris Gaffney, Joe Germanese, Drew Loucks, Dave Roberts, Mark Taber, Matt Vettel. Mike Thompson (MD, Head of Growth). Verified from greathillpartners.com/team.",score:"5"},
  {row:194,contact:"Dan O'Connell",title:"Founder & CEO",email:"",linkedin:"https://www.linkedin.com/company/vestar-capital-partners",notes:"NY-based. Middle market PE. Consumer, healthcare, industrials. Dan O'Connell (Founder/CEO), Norm Alpert (Founding Partner/President), Rob Rosner (Founding Partner). Ken O'Keefe (MD, COO, Head of IR). Verified from vestarcapital.com/team.",score:"5"},
  {row:195,contact:"",title:"",email:"",linkedin:"https://www.linkedin.com/company/norwest-equity-partners",notes:"Minneapolis/West Palm Beach. Middle market PE. Investment Team, Portfolio Advisory Team. JS-rendered team (no names extracted). Verified from nep.com/team.",score:"5"},
  {row:197,contact:"Donald J. Edwards",title:"Founder & Executive Chairman",email:"",linkedin:"https://www.linkedin.com/company/flexpoint-ford",notes:"Chicago. Financial services & healthcare PE. Don Edwards (Founder, Exec Chair), Chris Ackerman (CEO). Founded 2005. Verified from flexpointford.com/team.",score:"7"},
  {row:199,contact:"Steve Lefkowitz",title:"Co-Founder & CEO",email:"",linkedin:"https://www.linkedin.com/company/sagewind-capital",notes:"NY-based. Lower middle market PE. Steve Lefkowitz (Co-Founder/CEO), Raj Kanodia (Co-Founder/President), Gerry Dorros (MD). Buy-and-build strategy. Verified from sagewindcapital.com/team.",score:"5"},
  {row:200,contact:"",title:"",email:"",linkedin:"",notes:"cipcapital.com domain for sale on HugeDomains ($31K). Firm appears defunct.",score:"1"}
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'projects/gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const client = await auth.getClient();
  const sheets = google.sheets({version:'v4', auth: client});
  
  // Columns: A=Company Name, B=Contact Name, C=Title, D=Email, E=Website, F=LinkedIn, G=Sector Focus, H=Portfolio Companies, I=Status, J=Last Contacted, K=Notes, L=Company Info URL, M=Gumbo Score
  
  const data = [];
  for (const u of updates) {
    const rowNum = u.row;
    const requests = [];
    
    // Only update non-empty fields
    if (u.contact) {
      data.push({range: `Sheet1!B${rowNum}`, values: [[u.contact]]});
    }
    if (u.title) {
      data.push({range: `Sheet1!C${rowNum}`, values: [[u.title]]});
    }
    if (u.email) {
      data.push({range: `Sheet1!D${rowNum}`, values: [[u.email]]});
    }
    if (u.linkedin) {
      data.push({range: `Sheet1!F${rowNum}`, values: [[u.linkedin]]});
    }
    if (u.notes) {
      data.push({range: `Sheet1!K${rowNum}`, values: [[u.notes]]});
    }
    if (u.score) {
      data.push({range: `Sheet1!M${rowNum}`, values: [[u.score]]});
    }
    // Set status to Enriched
    data.push({range: `Sheet1!I${rowNum}`, values: [['Enriched']]});
  }
  
  console.log(`Updating ${data.length} cells across ${updates.length} firms...`);
  
  // Batch update
  const result = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: data
    }
  });
  
  console.log(`Updated ${result.data.totalUpdatedCells} cells successfully!`);
}

main().catch(console.error);
