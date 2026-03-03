const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // Updates: [row (1-indexed), updates object]
  const updates = [
    {
      // ROW 132 - Kinderhook Industries (row 133 in sheet, 1-indexed)
      row: 133,
      contactName: 'Liam Rogers',
      title: 'Managing Director, Head of Capital Formation & IR',
      email: 'lrogers@kinderhook.com',
      linkedin: 'https://www.linkedin.com/in/laroge/',
      status: 'Enriched',
      notes: '$8.5B committed capital. NYC. Founded 2003. 500+ investments. Healthcare services, environmental/business services, automotive/light manufacturing. $2.75B Fund 8 (Jun 2024, oversubscribed). Chris Michalik (MD). Paul Cifelli (MD). Liam Rogers email verified from kinderhook.com official press release (Fund 8 close, Jun 2024). Phone: 646-775-9991. 505 Fifth Ave 25th Fl, NYC. 2026-02-15 enrichment.'
    },
    {
      // ROW 133 - Pharos Capital Group (row 134 in sheet)
      row: 134,
      contactName: 'Adam Persiani',
      title: 'Managing Director, Business Development',
      email: 'apersiani@pharosfunds.com',
      linkedin: 'https://www.linkedin.com/in/adampersiani/',
      status: 'Enriched',
      notes: 'Physician-founded PE. Dallas/Nashville. $1.1B+ AUM. Healthcare-exclusive: lowers cost of care, improves outcomes, reduces inequalities in underserved markets. $25-50M checks. Kneeland Youngblood (Founder/Chairman/CEO, MD). Bob Crants (Partner). Jim Kerrigan (VP). Philip Butler (VP). Adam Persiani email verified from pharosfunds.com official page (FTN/ABA North Texas acquisition, Nov 2018). Phone: 214-740-7003. 2026-02-15 enrichment.'
    },
    {
      // ROW 113 - Sun Capital Partners (row 114 in sheet)
      row: 114,
      contactName: 'Pia De Sousa',
      title: 'Vice President, Marketing',
      email: 'pdesousa@suncappart.com',
      linkedin: 'https://www.linkedin.com/company/sun-capital-partners',
      status: 'Enriched',
      notes: 'Global PE, strong Operating Partners team with Sun Transformation System, Boca Raton/LA/NYC/London. 550+ portfolio cos. 30th anniversary (2025). Co-CEOs Marc Leder & Rodger Krouse. Matthew Garff (Sr MD & Partner, Co-Head US Transactions). Pia De Sousa (VP Marketing, pdesousa@suncappart.com) verified from suncappart.com promotions page (Feb 2025). Phone: 561-394-0550. Business Services, Consumer, Healthcare, Industrial, Technology sectors. 2026-02-15 enrichment.'
    },
    {
      // ROW 114 - Comvest Partners (row 115 in sheet)
      row: 115,
      contactName: 'Alex Ray',
      title: 'Managing Director, Business Development',
      email: 'a.ray@comvest.com',
      linkedin: 'https://www.linkedin.com/company/comvest-partners',
      status: 'Enriched',
      notes: '$9B+ invested capital. West Palm Beach. Founded 2000 (25th anniversary 2025). Now Comvest Private Equity (PE arm independent after Manulife bought credit arm Nov 2025). Maneesh Chawla (Managing Partner, m.chawla@comvest.com). Roger Marrero (Senior Partner, r.marrero@comvest.com). Alex Ray (MD BD, a.ray@comvest.com) verified from BusinessWire (team promotions Feb 2025, 25th anniversary Mar 2025). Also: Andrew Shear (Principal, a.shear@comvest.com), Derek Katchis (VP BD, d.katchis@comvest.com). Dedicated Operating Advisory Group (OAG). 2026-02-15 enrichment.'
    },
    {
      // ROW 148 - Blue Wolf Capital (row 149 in sheet)
      row: 149,
      contactName: 'Stephen Madsen',
      title: 'Business Development Contact',
      email: 'stephen@bluewolfcapital.com',
      linkedin: 'https://www.linkedin.com/company/blue-wolf-capital',
      status: 'Enriched',
      notes: 'NYC. Middle market PE. Healthcare & industrial sectors. $1.1B Fund V (2022). Adam Blumenthal (MP). 3 World Trade Center, 65th Fl. New Partners 2025: promotions announced Jan 2025. David Hecht (Operating Partner, healthcare, Mar 2024). CDMO platform (Sep 2024). Stephen Madsen (BD contact, stephen@bluewolfcapital.com) verified from bluewolfcapital.com/contact/ (official site). Also: info@bluewolfcapital.com. Phone: 212-488-1340. 2026-02-15 enrichment.'
    },
    {
      // ROW 149 - Highlander Partners (row 150 in sheet)
      row: 150,
      contactName: 'Jeff Hull',
      title: 'President & CEO',
      email: 'jhull@highlander-partners.com',
      linkedin: 'https://www.linkedin.com/company/highlander-partners',
      status: 'Enriched',
      notes: 'Dallas TX. $3B+ AUM. Deploys proprietary capital. Business services, healthcare services, food & consumer. Jeff Hull (President/CEO, jhull@highlander-partners.com) verified from BusinessWire (Bettera Brands/Catalent sale, Aug 2021). Still at firm per Katten law firm case studies (SFERRA/Antica Farmacista, Benestar Brands). Recent: Tapatio hot sauce acquisition (Jan 2026), Ergobaby (Dec 2024). Phone: 214-460-4858. 2026-02-15 enrichment.'
    },
  ];

  for (const u of updates) {
    const range = `Sheet1!B${u.row}:L${u.row}`;
    // Columns: B=Contact Name, C=Title, D=Email, E=Website (skip), F=LinkedIn, G-H (skip), I=Status, J=Last Contacted (skip), K=Notes
    
    // First read current row to preserve existing data
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${u.row}:L${u.row}`,
    });
    const row = current.data.values ? current.data.values[0] : [];
    console.log(`Updating row ${u.row}: ${row[0] || 'unknown'}`);
    
    // Update specific cells
    const updateRange = `Sheet1!B${u.row}:L${u.row}`;
    const values = [
      u.contactName,           // B - Contact Name
      u.title,                 // C - Title
      u.email,                 // D - Email
      row[4] || '',            // E - Website (preserve)
      u.linkedin,              // F - LinkedIn
      row[6] || '',            // G - Sector Focus (preserve)
      row[7] || '',            // H - Portfolio Companies (preserve)
      u.status,                // I - Status
      row[9] || '',            // J - Last Contacted (preserve)
      u.notes,                 // K - Notes
      row[11] || '',           // L - Company Info URL (preserve)
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
    console.log(`  ✅ Updated: ${u.contactName} (${u.email})`);
  }

  console.log(`\nDone! Updated ${updates.length} rows.`);
}

main().catch(console.error);
