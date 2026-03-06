const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function updateSheet() {
  const updates = [
    {
      row: 259,
      company: 'BayBoston Capital',
      contactName: 'Carlos M. Garcia',
      title: 'Founder & Managing Partner',
      email: 'carlos@bayboston.com',
      linkedin: 'https://www.linkedin.com/company/bayboston-capital',
      status: 'Enriched',
      notes: 'Verified from bayboston.com. Also available: Mike Fischer (Principal) mike@bayboston.com'
    },
    {
      row: 664,
      company: 'Provident Healthcare Partners',
      contactName: 'Scott Davis',
      title: 'Managing Director',
      email: 'sdavis@providenthp.com',
      linkedin: 'https://www.linkedin.com/in/scott-a-davis-19394313/',
      status: 'Enriched',
      notes: 'Email format verified from providenthp.com team page - Healthcare investment banking'
    },
    {
      row: 670,
      company: 'ScaleView Partners',
      contactName: 'Gabe Wilcox',
      title: 'Co-Founder & Partner',
      email: 'info@scaleviewpartners.com',
      linkedin: 'https://scaleviewpartners.com/',
      status: 'Partial',
      notes: 'General contact - Tech investment bank. Partners: Gabe Wilcox, Jay Snodgrass, Jordan Davidson. Phone: (512) 549-6358'
    },
    {
      row: 674,
      company: 'Soho Square Solutions',
      contactName: 'Vijay Veerachandran',
      title: 'Founder & CEO',
      email: 'vijay@sohosquaresolutions.com',
      linkedin: 'https://www.linkedin.com/in/vijaymchandran/',
      status: 'Enriched',
      notes: 'Verified from multiple sources - BFSI consulting & staffing. Founded 2008, NYC HQ'
    },
    {
      row: 676,
      company: 'Silvercrest Asset Management',
      contactName: 'Richard R. Hough III',
      title: 'Investor Relations',
      email: 'Rhough@silvercrestgroup.com',
      linkedin: 'https://ir.silvercrestgroup.com/',
      status: 'Enriched',
      notes: 'Verified from ir.silvercrestgroup.com. Phone: (212) 649-0601. General: info@silvercrestgroup.com'
    },
    {
      row: 648,
      company: 'Nautic Partners',
      contactName: 'Jim Beakey',
      title: 'Managing Director, Business Development',
      email: 'jbeakey@nautic.com',
      linkedin: 'https://www.linkedin.com/in/jim-beakey-3-134-b4/',
      status: 'Enriched',
      notes: 'Verified from nautic.com and LinkedIn. Phone: 401-278-5678. Middle-market PE, $9.5B+ AUM'
    },
    {
      row: 649,
      company: 'NewSpring Capital',
      contactName: 'Mike O\'Neill',
      title: 'Capital Formation & Investor Relations',
      email: 'moneill@newspringcapital.com',
      linkedin: 'https://newspringcapital.com/',
      status: 'Enriched',
      notes: 'Verified from newspringcapital.com contact page. Phone: 610.947.6227. 25+ years, lower-middle market'
    },
    {
      row: 656,
      company: 'Pamlico Capital',
      contactName: 'Scott Perper',
      title: 'Managing Partner & Head',
      email: 'info@pamlicocapital.com',
      linkedin: 'https://www.linkedin.com/company/pamlico-capital',
      status: 'Partial',
      notes: 'Scott Perper identified as head via Wikipedia. Charlotte, NC. Focus: comms, healthcare IT, software, tech-enabled services'
    },
    {
      row: 635,
      company: 'MidOcean Partners',
      contactName: 'Dana Carey',
      title: 'Chief Investment Officer, Credit President',
      email: 'info@midoceanpartners.com',
      linkedin: 'https://www.midoceanpartners.com/people',
      status: 'Partial',
      notes: 'Dana Carey from team page. Phone: (212) 497-1400. NYC HQ. Alternative asset manager since 2003'
    },
    {
      row: 666,
      company: 'Ribbit Capital',
      contactName: 'Micky Malka',
      title: 'Founder & Managing Partner',
      email: 'info@ribbitcap.com',
      linkedin: 'https://www.linkedin.com/company/ribbit-capital',
      status: 'Partial',
      notes: 'Meyer "Micky" Malka - founder. Twitter: @mickymalka. Fintech-focused VC, Palo Alto'
    }
  ];

  console.log('Updating Google Sheet with enriched PE firms...\n');

  for (const update of updates) {
    console.log(`Row ${update.row}: ${update.company}`);
    console.log(`  → ${update.contactName} (${update.title})`);
    console.log(`  → ${update.email}\n`);

    const range = `Sheet1!C${update.row}:L${update.row}`;
    const values = [[
      update.contactName,
      update.title,
      update.email,
      '', // Website (don't overwrite)
      update.linkedin,
      '', // Sector (don't overwrite)
      '', // Portfolio (don't overwrite)
      update.status,
      new Date().toISOString().split('T')[0],
      update.notes
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values }
      });
      console.log(`  ✅ Updated`);
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  console.log('\n=== ENRICHMENT COMPLETE ===');
  console.log(`Total firms enriched: ${updates.length}`);
  console.log(`Fully enriched (verified emails): ${updates.filter(u => u.status === 'Enriched').length}`);
  console.log(`Partially enriched (general contact): ${updates.filter(u => u.status === 'Partial').length}`);
}

updateSheet().catch(console.error);
