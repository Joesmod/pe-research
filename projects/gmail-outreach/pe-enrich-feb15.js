const {google} = require('googleapis');
const path = require('path');
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});

  const updates = [
    // ROW195 = Sheet1 row 196 (0-indexed row 195) -> HCI Equity Partners
    // Columns: A=Company, B=Contact Name, C=Title, D=Email, E=Website, F=LinkedIn, G=Sector, H=Portfolio, I=Status, J=Last Contacted, K=Notes, L=Company Info URL
    {row: 196, col: 'B', val: 'Tim Frend'},
    {row: 196, col: 'C', val: 'Partner, Business Development'},
    {row: 196, col: 'D', val: 'tfrend@hciequity.com'},
    {row: 196, col: 'I', val: 'Enriched'},
    {row: 196, col: 'K', val: 'Washington DC. LMM PE. Founded 2002. 6x Inc Founder-Friendly. Tim Frend (Partner BD, tfrend@hciequity.com) verified from hciequity.com/contact/ (official site). Also: Tiffany Ferriss-Wade (Sr EA, tferriss-wade@hciequity.com). Jeff DeSandre (Executive Partner IT, joined Jul 2025). Value-added distribution, industrial, business services. Phone: 202-371-0150. 2026-02-15 enrichment.'},

    // ROW108 = Sheet1 row 109 -> Prospect Partners
    {row: 109, col: 'B', val: 'Brad O\'Dell'},
    {row: 109, col: 'C', val: 'Partner'},
    {row: 109, col: 'D', val: 'bodell@prospect-partners.com'},
    {row: 109, col: 'I', val: 'Enriched'},
    {row: 109, col: 'K', val: 'Chicago. LMM PE. 25+ yrs. Brad O\'Dell (Partner, bodell@prospect-partners.com, 312-801-8624) and Brad Holcomb (Partner, bholcomb@prospect-partners.com, 312-801-8625) and Mike McInerney (Partner, mmcinerney@prospect-partners.com, 312-801-8626) ALL verified from prospect-partners.com official contact page. 227 W Monroe St Ste 3550, Chicago IL 60606. 110+ yrs collective experience. Focused on entrepreneurs/founders. 2026-02-15 enrichment.'},

    // ROW189 = Sheet1 row 190 -> Gridiron Capital
    {row: 190, col: 'B', val: 'Kevin Jackson'},
    {row: 190, col: 'C', val: 'Managing Partner'},
    {row: 190, col: 'D', val: 'kjackson@gridironcapital.com'},
    {row: 190, col: 'I', val: 'Enriched'},
    {row: 190, col: 'K', val: 'New Canaan CT. Mid-market PE. Founded 2006. $2.1B Fund V (Oct 2023, above target). Kevin Jackson (MP, kjackson@gridironcapital.com) verified from PRNewswire (Health Monitor Network Oct 2024, ABC Legal Aug 2025). Tom Burger (Co-Founder/MP, tburger@gridironcapital.com) verified from PRNewswire (Fund IV close Dec 2020, ABC Legal Aug 2025). Business services, consumer, industrial. 2026-02-15 enrichment.'},

    // ROW197 = Sheet1 row 198 -> NewSpring Capital
    {row: 198, col: 'B', val: 'Mike O\'Neill'},
    {row: 198, col: 'C', val: 'Capital Formation & Investor Relations'},
    {row: 198, col: 'D', val: 'moneill@newspringcapital.com'},
    {row: 198, col: 'I', val: 'Enriched'},
    {row: 198, col: 'K', val: 'Radnor PA. Founded 1999. 151+ investments. Multi-strategy: Growth, Health, Holdings, Mezzanine. Mike O\'Neill (Capital Formation & IR, moneill@newspringcapital.com, 610-947-6227) verified from newspringcapital.com/contact (official site). Hart Callahan (General Partner, healthcare). Skip Maner (GP, smaner@newspringcapital.com, verified BusinessWire Nov 2013). Recent: Sorcero $42.5M Series B (Nov 2025), CoreX ServiceNow (May 2024). 2026-02-15 enrichment.'},

    // ROW126 = Sheet1 row 127 -> RFE Investment Partners
    {row: 127, col: 'B', val: 'Peter Reiter'},
    {row: 127, col: 'C', val: 'Partner'},
    {row: 127, col: 'D', val: 'preiter@rfeip.com'},
    {row: 127, col: 'I', val: 'Enriched'},
    {row: 127, col: 'K', val: 'New Canaan CT. 30+ yrs LMM PE. Peter Reiter (Partner, preiter@rfeip.com, 203-966-2800 x6507) verified from rfeip.com team page. Jim Parsons (Co-Chairman, jparsons@rfeip.com, x6503) verified from rfeip.com. Wilson Ren (VP, wren@rfeip.com, 203-716-6509) verified from rfeip.com. Growth strategies in N. American small market companies. 2026-02-15 enrichment.'},

    // ROW139 = Sheet1 row 140 -> Leeds Equity Partners
    {row: 140, col: 'B', val: 'Danielle Derrico'},
    {row: 140, col: 'C', val: 'Chief Administrative Officer'},
    {row: 140, col: 'D', val: 'dderrico@leedsequity.com'},
    {row: 140, col: 'I', val: 'Enriched'},
    {row: 140, col: 'K', val: 'NYC. Founded 1993. ~$7B AUM (Jan 2026). Exclusively Knowledge Industries (education, training, info/data services). Jeffrey Leeds (Co-Founder/MP). Jacques Galante (Partner). Danielle Derrico (CAO, promoted Jan 2026, previously IR/BD since 2017, dderrico@leedsequity.com) verified from PRNewswire (engage2learn May 2021). Andrew Hermalyn (Operating Partner, Mar 2025). 7th fund. Recent: 95 Percent Group/AALP (Sep 2025). 2026-02-15 enrichment.'},

    // ROW136 = Sheet1 row 137 -> Spire Capital Partners
    {row: 137, col: 'B', val: 'David Schaible'},
    {row: 137, col: 'C', val: 'Partner'},
    {row: 137, col: 'D', val: 'dschaible@spirecapital.com'},
    {row: 137, col: 'I', val: 'Enriched'},
    {row: 137, col: 'K', val: 'NYC. Tech-enabled business services, media, education, communications. David Schaible (Partner, dschaible@spirecapital.com, 212-218-5454) verified from spirecapital.com press releases (Advocate Networks Jun 2022, WatchMeGrow May 2024). Brad Johnson (Principal, bjohnson@spirecapital.com, 212-218-5470) verified from spirecapital.com (PROtect sale Nov 2024). SEC-registered investment advisor. 2026-02-15 enrichment.'},

    // Also update Frontenac (ROW109) with notes even though no direct email found
    {row: 110, col: 'K', val: 'Chicago. Founded 1971. LMM buyouts. CEO1ST approach - pairs PE with experienced operating leaders. Consumer, industrial, services. Paul Carbery (MP), Sam Nichols (Partner). info@frontenac.com only (from contact page). No partner emails published in press releases or on website. 155 N Wacker Ste 1150. 2026-02-15 re-research, no direct emails found.'},

    // Update Thompson Street Capital (ROW190) notes
    {row: 191, col: 'K', val: 'St. Louis. Founded 2000. $4.5B+ managed. 200+ acquisitions. Life Sciences/Healthcare, Software/Tech, Business/Consumer Services. Uses BackBay Communications for PR (Jeremy Milner, jmilner@backbaycommunications.com). Recent: Complex Claims Recovery (Dec 2025), PestCo/Southwest Exterminating (Dec 2025). No direct @tscp.com emails found in press releases. Phone: 314-727-2112. 120 S Central Ave Ste 600. 2026-02-15 research.'},

    // Update Blackford Capital (ROW134) notes
    {row: 135, col: 'K', val: 'Grand Rapids MI. Founded 2010. LMM PE. Martin Stein (Founder/MD, 18+ yr PE). Jeff Johnson (MD, 28 yrs). Grand Rapids 200 list (2023-2024). Inc 5000 recognized. Only info@blackfordcapital.com published. Contact page has form only. No direct partner emails found. Manufacturing, distribution, services. 2026-02-15 re-research confirmed no direct emails.'},

    // Update Stellex Capital (ROW135) with team info
    {row: 136, col: 'K', val: 'NYC/London/Pittsburgh. Ex-Carlyle Group (Mitch Whiteman, Founder/MP). Industrial services, business services, aerospace/defense, govt services, tech-enabled services. Jennifer Colvin (Dir BD, Washington DC, joined Jan 2025). Scott Kingsley (VP BD, Boston, joined Jan 2025). Jason LaDuke (Head of Portfolio Ops, joined Feb 2025). Uses Prosek Partners (pro-stellex@prosek.com) and Marketcom PR. No direct @stellexcapital.com emails found. 2026-02-15 research.'},
  ];

  for (const u of updates) {
    const range = `Sheet1!${u.col}${u.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      requestBody: { values: [[u.val]] }
    });
    console.log(`Updated ${range}`);
  }

  console.log(`Done! Updated ${updates.length} cells across ${new Set(updates.map(u => u.row)).size} rows.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
