const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});

  // Updates: row number (1-indexed), column letter, value
  const updates = [
    // Row 7 (Olympus/Kelso - fix: row 7 is Olympus Partners) - update notes
    // Actually let me just document re-research findings in notes for firms I investigated

    // Knox Capital (row 18) - no direct emails found, only info@knox-cap.com
    {row: 18, col: 'K', val: 'Chicago-based. Gregor (20yr, ex-Pfingsten, Kellogg MBA), Bryant (CEO nSource, ex-Integreon KPO, MIT Sloan), Pacelli (ex-Wind Point, Yale/Booth). Tech-enabled services thesis = perfect Gumbo fit. Only info@knox-cap.com published on site. No direct partner emails found in 6+ BusinessWire/PRNewswire releases (2014-2022). Phone: 312.402.1425. 145 S Wells Ste 1800, Chicago IL 60606. 2026-02-14 deep re-research.'},

    // JLL Partners (row 16) - only IR@jllpartners.com, Cara Killackey is Head of Capital Formation
    {row: 16, col: 'B', val: 'Cara Killackey Lee'},
    {row: 16, col: 'C', val: 'Head of Capital Formation'},
    {row: 16, col: 'D', val: 'IR@jllpartners.com'},
    {row: 16, col: 'K', val: 'Score 9. HAS CHIEF AI OFFICER (Jeff Hunter, Sep 2025). Raj Bhavsar (CTO, Apr 2025). Gerard Van Spaendonck (Head of Value Creation). Cara Killackey Lee (Head of Capital Formation, joined Jan 2024). Dan Agroskin (MP). Kevin Hammond (MP). Dan Di Piazza (MD, promoted Feb 2025). Recent: PowerParts Group (Jan 2026). IR@jllpartners.com from privacy policy page (verified). 300 Park Ave 18th Fl, NYC. 2026-02-14 enrichment.'},
    {row: 16, col: 'I', val: 'Enriched'},

    // Huron Capital (row 26) - uses Lambert & Co PR, no direct emails
    {row: 26, col: 'K', val: '$2B+ AUM. Detroit. Founded 1999. Jim Mahoney (MP since Feb 2021). Brian Demkowicz (Chairman/Founding Partner). Scott Hauncher (Partner, joined 2018). David Reynolds (Sr Partner). 290+ companies across 7 funds. ExecFactor program. HCP Services Partners platform (2024). Uses Lambert & Co. PR firm (Brent Snavely). All press releases list Lambert as media contact. No direct @huroncapital.com emails found in 10+ PRNewswire releases 2018-2025. 2026-02-14 deep re-research confirmed.'},

    // Svoboda Capital (row 57) - only contact form, no published emails
    {row: 57, col: 'K', val: 'Chicago. Founded 1998. ~12 professionals. Pure business services focus (professional, industrial/commercial, transportation/logistics). Growth-oriented, empowers management teams. One North Franklin St Ste 1105. Phone: 312.267.8750. Website has contact form only, no published emails. 2026-02-14 deep re-research.'},

    // Incline Equity (row 27) - no direct emails, website 403
    {row: 27, col: 'K', val: '$1.9B+ AUM. Pittsburgh. Founded 2011. Jack Glover (Founder/MP, 30+ yr PE career). $500M Ascent II fund closed Jan 2025 (oversubscribed). $1.9B Fund VI (2023). deals@inclineequity.com from LinkedIn. Distribution, specialized mfg, services. Recent: Advanced Solutions Intl (Oct 2025). Website blocks direct access (403). No direct partner emails found in 5+ PRNewswire releases 2024-2025. 2026-02-14 re-research confirmed.'},

    // Diversis Capital (row 91) - no direct emails
    {row: 91, col: 'K', val: 'Irvine CA. Founded 2013. $3B+ AUM. Kevin Ma (MP, Wharton M&T, ex-BCG) & Ron Nayot (MP, ex-Gores Group). Software/tech-enabled services. $1.2B Fund III (Oct 2025, oversubscribed at hard cap). Kevin Ma: "AI experience of our deep bench of operating partners." No direct partner emails published across 5+ PRNewswire releases 2016-2025. Marc Luzzatto (Chairman). Uses William Blair placement agent. 2026-02-14 re-research confirmed.'},

    // WindRose Health (row 59) - $2.6B Fund VII, uses Lambert PR
    {row: 59, col: 'K', val: 'NYC. 30+ yr healthcare investor. $7B AUM. $2.6B Fund VII closed Dec 2025 (hard cap, 6 months). 5 Partners: Moses, Buzik, Burnes, Pontius, Hall. 12 Operating Partners. Catherine Coleman (Head IR). Michael Spiciarich (CFO/CCO). Uses Lambert by LLYC for PR (Caroline Luz, 203-570-6462). No direct @windrose.com partner emails found. 2026-02-14 re-research.'},

    // Trivest Partners (row 60) - $6B capital under mgmt, no direct emails
    {row: 60, col: 'K', val: 'Coral Gables FL. Founded 1981 (40+ yrs). $6B capital under management across 4 funds. 5 Managing Partners: Templeton, Elias, Gershman, Gross, Wester. Stephen Koren (Principal). Jonathan Hamilton (Portfolio Ops Exec, 2025). Path to 3x value creation. Inc Founder-Friendly. Offices: Miami, Charlotte, Chicago, Denver, LA, NYC, Toronto. No direct partner emails published. 2026-02-14 re-research.'},

    // Kohlberg & Company (row 62) - massive firm, no direct emails
    {row: 62, col: 'K', val: 'Mt Kisco NY. $4.3B Fund X (Sep 2024) + ~$1B co-invest vehicles. 125+ LPs. Founded by Jerome Kohlberg Jr. Sam Frieder (MP). Gordon Woodward (Partner, CIO). Seth Hollander (Partner). Jessica Hoffman Brennan (Partner, Head of Strategy & IR). Matt Jennings (Operating Partner). Kate Renwick (Operating Partner). 90+ investment & portfolio support professionals. Sector-specialized White Paper strategy. No public partner emails found. 2026-02-14 re-research confirmed.'},

    // Lightyear Capital (row 81) - no direct emails
    {row: 81, col: 'K', val: 'NYC. Founded 2002 by Donald Marron (ex-PaineWebber CEO, deceased 2019). Mark Vassallo (MP). Partners: Jay Comerford, Max Rakhlin, Trevor Pieri, Michael Langer (MD Healthcare, joined Sep 2022). Tom Naratil (Operating Partner, ex-UBS). Financial services/insurance/healthcare focus. Uses Sloane & Co for PR. No direct partner emails found across 5+ BusinessWire releases 2021-2025. 2026-02-14 deep re-research confirmed.'},

    // Amulet Capital (row 40) - no direct emails, only contact form
    {row: 40, col: 'K', val: 'Greenwich CT. $1.2B Fund III (Jul 2024, above target). Healthcare-exclusive. Co-founders: Jay Rose (President/MP, ex-Health Evolution Partners, MD) & Ramsey Frank (President/MP, ex-JLL Partners). Michael Keaveney (Head of IR, joined Sep 2024, ex-Atlantic Pacific Capital). Uses Joele Frank for PR. Website has contact form only, no published emails. 2026-02-14 deep re-research.'},
  ];

  for (const u of updates) {
    const range = `${u.col}${u.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      requestBody: { values: [[u.val]] }
    });
    console.log(`Updated ${range}`);
  }

  console.log('Done! Updated', updates.length, 'cells');
}

main().catch(e => { console.error(e); process.exit(1); });
