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

  // Each update targets specific cells: B=Contact, C=Title, D=Email, F=LinkedIn, I=Status, K=Notes
  const cellUpdates = [
    // ROW100 = sheet row 101 - Excellere Partners
    { range: 'Sheet1!B101', values: [['Tracie Kelly']] },
    { range: 'Sheet1!C101', values: [['Director of Marketing']] },
    { range: 'Sheet1!D101', values: [['tkelly@excellere.com']] },
    { range: 'Sheet1!I101', values: [['Enriched']] },
    { range: 'Sheet1!K101', values: [['Denver-based. Growth recaps & MBOs. MPs: Brad Cornell, Ryan Glaws, Matt Hicks, Patrick O\'Keefe. Justin Unertl & Mike Vieth (Partners). Healthcare, industrial growth, business services. Tracie Kelly (Dir Marketing, tkelly@excellere.com, 303-765-2374) verified from BusinessWire (Feb 2025, Jun 2024, Oct 2023). 2026-02-15 enrichment.']] },

    // ROW101 = sheet row 102 - Metamora Growth Partners
    { range: 'Sheet1!B102', values: [['Ali Evans']] },
    { range: 'Sheet1!C102', values: [['CEO']] },
    { range: 'Sheet1!D102', values: [['ali@metamoragrowth.com']] },
    { range: 'Sheet1!I102', values: [['Enriched']] },
    { range: 'Sheet1!K102', values: [['#2 on Axial Top 50 LMM Tech Investors 2025. Ali Evans (CEO, ali@metamoragrowth.com) verified from EIN Presswire (Perspecta/TalisPoint merger, Oct 2023). 2026-02-15 enrichment.']] },

    // ROW104 = sheet row 105 - Littlejohn & Co
    { range: 'Sheet1!B105', values: [['Jordan Tongalson']] },
    { range: 'Sheet1!C105', values: [['Managing Director, Head of Business Development']] },
    { range: 'Sheet1!D105', values: [['jtongalson@littlejohnllc.com']] },
    { range: 'Sheet1!F105', values: [['https://www.linkedin.com/in/jordan-tongalson-662849']] },
    { range: 'Sheet1!I105', values: [['Enriched']] },
    { range: 'Sheet1!K105', values: [['Greenwich CT. ~$14B regulatory AUM. Integrated PE + special situations. Mid-market industrial & services. Jordan Tongalson (MD Head of BD, jtongalson@littlejohnllc.com) verified from littlejohnllc.com/contact/ (official site). Philip Lo (IR, ir@littlejohnllc.com). Recent: 80/20 acquisition (Feb 2026). 2026-02-15 enrichment.']] },

    // ROW106 = sheet row 107 - Odyssey Investment Partners
    { range: 'Sheet1!D107', values: [['BD@odysseyinvestment.com']] },
    { range: 'Sheet1!K107', values: [['NYC-based. $3.25B Fund VI. Industrial + business services. BD@odysseyinvestment.com from official contact page (odysseyinvestment.com/contact/). Also: info@odysseyinvestment.com. 590 Madison Ave Fl 39. (212) 351-7900. 2026-02-15 enrichment update.']] },

    // ROW109 = sheet row 110 - Frontenac Company
    { range: 'Sheet1!B110', values: [['Teri Tadros']] },
    { range: 'Sheet1!C110', values: [['Director of Strategic Growth']] },
    { range: 'Sheet1!D110', values: [['ttadros@frontenac.com']] },
    { range: 'Sheet1!I110', values: [['Enriched']] },
    { range: 'Sheet1!K110', values: [['Chicago. Founded 1971. LMM buyouts. CEO1ST approach. Paul Carbery (MP), Sam Nichols (Partner). Teri Tadros (Dir Strategic Growth, ttadros@frontenac.com) verified from BusinessWire (PLZ/Liquid Technologies, Dec 2019). Returned to firm Aug 2024 per frontenac.com. Consumer, industrial, services. 2026-02-15 enrichment.']] },

    // ROW117 = sheet row 118 - Capstreet
    { range: 'Sheet1!B118', values: [['Michelle Lewis']] },
    { range: 'Sheet1!C118', values: [['Principal, Head of Business Development']] },
    { range: 'Sheet1!D118', values: [['MLewis@capstreet.com']] },
    { range: 'Sheet1!I118', values: [['Enriched']] },
    { range: 'Sheet1!K118', values: [['Houston, 1990 founding, Capvalue Framework, Top 50 PE Middle Market 2026. Neil Kallmeyer & George Kelly (MPs). Michelle Lewis (Principal & Head of BD, MLewis@capstreet.com, 713-332-2748) verified from capstreet.com official page. $500M Fund V. Industrial distribution, mfg, business services, tech-enabled services. 2026-02-15 enrichment.']] },

    // ROW118 = sheet row 119 - Alpine Investors
    { range: 'Sheet1!B119', values: [['Audrey Harris']] },
    { range: 'Sheet1!C119', values: [['Head of Marketing']] },
    { range: 'Sheet1!D119', values: [['aharris@alpineinvestors.com']] },
    { range: 'Sheet1!I119', values: [['Enriched']] },
    { range: 'Sheet1!K119', values: [['~$5B+ AUM. SF-based. PeopleFirst approach, CEO-in-Training program. 190 deals in 2025. ASG software arm. Graham Weaver (CEO/Founder). Audrey Harris (Head of Marketing, aharris@alpineinvestors.com) verified from BusinessWire (Fund IX Jul 2023, Apex Oct 2023, Promotions Jan 2024). 2026-02-15 enrichment.']] },

    // ROW120 = sheet row 121 - O2 Investment Partners
    { range: 'Sheet1!B121', values: [['Luke Plumpton']] },
    { range: 'Sheet1!C121', values: [['Managing Partner']] },
    { range: 'Sheet1!D121', values: [['lplumpton@o2investment.com']] },
    { range: 'Sheet1!I121', values: [['Enriched']] },
    { range: 'Sheet1!K121', values: [['Detroit. $445M Fund IV (Apr 2023). Luke Plumpton (MP, lplumpton@o2investment.com, 248-554-4215) verified from BusinessWire (Jan 2025, Nov 2024, Apr 2023). Also: Charlie Miller (cmiller@o2investment.com, Jul 2024), Andrew Faubel (afaubel@o2investment.com, Aug 2024). Niche services, tech, industrial. 100+ transactions. 2026-02-15 enrichment.']] },
  ];

  for (const u of cellUpdates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: u.range,
      valueInputOption: 'RAW',
      resource: { values: u.values }
    });
    console.log('Updated:', u.range);
  }

  console.log('All updates complete!');
}
main().catch(e => { console.error(e.message); process.exit(1); });
