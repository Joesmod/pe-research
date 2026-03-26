const { google } = require('googleapis');

async function addNewFirms() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    // New firms data
    const newFirms = [
      {
        company: 'WILsquare Capital',
        notebookLM: 'https://www.wilsquare.com/',
        contact: 'Andrew Scharf',
        title: 'Managing Director',
        email: 'ascharf@WILsquare.com',
        website: 'https://www.wilsquare.com/',
        linkedin: 'https://www.linkedin.com/company/wilsquare-capital',
        status: 'Enriched',
        notes: 'St. Louis-based lower-middle market PE. Business services, niche manufacturing, distribution, technology. Email verified from official team page. Joined from Croft & Bender, prev PwC. Tulane MBA. Source: wilsquare.com/andrew',
      },
      {
        company: 'Argosy Private Equity',
        notebookLM: 'https://argosycapital.com/private-equity/',
        contact: 'Keven Shanahan',
        title: 'Managing Partner',
        email: 'kshanahan@argosycapital.com',
        website: 'https://argosycapital.com/',
        linkedin: 'https://www.linkedin.com/in/keven-shanahan-49715a21/',
        status: 'Enriched',
        notes: 'Founded 1990, 30+ years track record. Lower middle market advanced manufacturing and business services. $1.5B realizations, 140+ platform investments. Joined 2004, ex-GE Capital, Tuck MBA, Harvard BA. Email verified from official team page.',
      },
      {
        company: 'ShoreView',
        notebookLM: 'https://www.shoreview.com/',
        contact: 'Scott Gage',
        title: 'Partner',
        email: 'info@shoreview.com',
        website: 'https://www.shoreview.com/',
        linkedin: 'https://www.linkedin.com/company/shoreview-industries',
        status: 'Needs Manual Research',
        notes: 'Minneapolis-based, founded 2002. $1.8B+ committed capital, 41+ platform investments. Engineered products, distribution, industrial services, business services, healthcare, niche consumer. General email only - needs individual contact enrichment. Scott Gage joined 2004, 25+ years PE experience.',
      },
    ];

    console.log(`Adding ${newFirms.length} new firms to the sheet...`);

    for (const firm of newFirms) {
      const values = [
        [
          firm.company,
          firm.notebookLM,
          firm.contact,
          firm.title,
          firm.email,
          firm.website,
          firm.linkedin,
          firm.status,
          firm.notes,
        ],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:I',
        valueInputOption: 'RAW',
        resource: { values },
      });

      console.log(`✅ Added: ${firm.company} - ${firm.contact}`);
    }

    console.log('\n✅ All firms added successfully!');
    console.log(`\nSummary: ${newFirms.length} new mid-market PE firms added to pipeline`);
    console.log('Focus: Business services, healthcare, industrial services');
    console.log('AUM range: $500M-$5B (target mid-market)');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

addNewFirms();
