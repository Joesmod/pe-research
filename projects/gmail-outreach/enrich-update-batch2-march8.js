const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('📝 Batch 2 Enrichment Update - March 8, 5:36 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const updates = [
    {
      row: 387,
      company: '424 Capital',
      contactName: 'Kyle Stanbro',
      title: 'Co-Founder & Managing Partner',
      email: 'kstanbro@424capital.com',
      linkedin: 'https://www.linkedin.com/in/kyle-stanbro-0ba6a913/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email published on website. B2B tech-enabled services focus, lower middle market. Founded 2019.'
    },
    {
      row: 388,
      company: 'Aeris Partners',
      contactName: '',
      title: '',
      email: 'info@aerispartners.com',
      linkedin: '',
      status: 'Dead - Investment Bank',
      notes: 'M&A advisory/investment bank (tech), not a PE firm. FINRA/SIPC registered broker-dealer.'
    },
    {
      row: 389,
      company: 'Alvarez & Marsal Capital',
      contactName: 'Jack McCarthy',
      title: 'Managing Partner & Founder',
      email: 'jack@a-mcapital.com',
      linkedin: 'https://www.linkedin.com/in/jack-mccarthy-204584a/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email pattern verified via RocketReach (70.1%): first@a-mcapital.com. Founded 2011, affiliated with A&M operational advisory.'
    },
    {
      row: 390,
      company: 'Apex Service Partners',
      contactName: '',
      title: '',
      email: 'info@apexservicepartners.com',
      linkedin: '',
      status: 'Dead - Portfolio Company',
      notes: 'HVAC/plumbing/electrical services platform backed by Alpine Investors (the actual PE firm). Not a PE firm.'
    },
    {
      row: 392,
      company: 'Avenue Growth Partners',
      contactName: 'Brian Goldsmith',
      title: 'Co-Founder & Partner',
      email: 'brian@avenuegp.com',
      linkedin: 'https://www.linkedin.com/in/goldsmithbrian/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email verified via ContactOut. Also: Ryan Russell (Co-Founder, r******@avenuegp.com). B2B software growth equity, founded 2020.'
    },
    {
      row: 393,
      company: 'Bespoke Partners',
      contactName: '',
      title: '',
      email: 'leadercommunity@bespokepartners.com',
      linkedin: '',
      status: 'Dead - Executive Search',
      notes: 'Executive recruiting firm serving PE/VC software companies. Not a PE firm.'
    },
    {
      row: 394,
      company: 'Blue Star Innovation Partners',
      contactName: 'Rob Wechsler',
      title: 'Founder / Managing Partner',
      email: 'rob@bluestarinnovationpartners.com',
      linkedin: '',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email pattern verified via RocketReach (51.7%): first@bluestarinnovationpartners.com. Also: Dan Wechsler (CEO/MP). Frisco-based, software/payments, Jerry Jones backed. Founded 2017.'
    }
  ];

  console.log(`Updating ${updates.length} rows...\n`);

  for (const update of updates) {
    const range = `Sheet1!C${update.row}:L${update.row}`;
    const values = [[
      update.contactName,
      update.title,
      update.email,
      '', // Website (preserve)
      update.linkedin,
      '', // Sector (preserve)
      '', // Portfolio (preserve)
      update.status,
      '', // Last Contacted (preserve)
      update.notes
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✅ Row ${update.row}: ${update.company} - ${update.status}`);
    } catch (err) {
      console.error(`❌ Row ${update.row}: Failed - ${err.message}`);
    }
  }

  console.log('\n✅ Batch 2 complete!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
