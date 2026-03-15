const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('📝 Updating Sheet with Enrichment Data - March 8, 5:36 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Enrichment data (row numbers are 1-indexed + header)
  const updates = [
    {
      row: 378,
      company: 'Regal Healthcare Capital Partners',
      contactName: 'Jon Santemma',
      title: 'Co-Founder & General Partner',
      email: 'jsantemma@regalhcp.com',
      linkedin: 'https://www.linkedin.com/in/jon-e-santemma-5632b316/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'ContactOut verified. Also found: David Kim (Co-Founder & GP, pattern d******@regalhcp.com per RocketReach).'
    },
    {
      row: 380,
      company: 'SDC Capital Partners',
      contactName: 'Todd Aaron',
      title: 'Founder & Managing Partner',
      email: 'taaron@sdccapitalpartners.com',
      linkedin: 'https://www.linkedin.com/in/toddaaron/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email pattern verified via RocketReach (t******@sdccapitalpartners.com). $8.8B AUM, digital infrastructure focus. Founded 2017.'
    },
    {
      row: 384,
      company: 'Thesis Capital Partners',
      contactName: 'Connor Chakeen',
      title: 'Partner',
      email: 'Connor.Chakeen@thesiscapital.com',
      linkedin: '',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email published on website press release. Pattern: First.Last@thesiscapital.com. Also: Ian J.H. Reynolds (Managing Partner, Ian.Reynolds@thesiscapital.com inferred).'
    },
    {
      row: 386,
      company: 'TT Capital Partners',
      contactName: 'Kevin Green',
      title: 'Executive Chairman & Partner (Founder)',
      email: 'kgreen@ttcapitalpartners.com',
      linkedin: '',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email pattern verified via RocketReach (100%): first_initial last@ttcapitalpartners.com. Also: Adam Letson (Partner, aletson@ttcapitalpartners.com). Healthcare IT & services PE.'
    }
  ];

  console.log(`Updating ${updates.length} rows...\n`);

  for (const update of updates) {
    const range = `Sheet1!C${update.row}:L${update.row}`; // Contact Name through Notes
    const values = [[
      update.contactName,
      update.title,
      update.email,
      '', // Website (preserve existing)
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
      console.log(`✅ Row ${update.row}: ${update.company} - ${update.contactName}`);
    } catch (err) {
      console.error(`❌ Row ${update.row}: Failed - ${err.message}`);
    }
  }

  console.log('\n✅ Enrichment update complete!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
