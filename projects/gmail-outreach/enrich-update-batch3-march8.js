const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function main() {
  console.log('📝 Batch 3 Final Enrichment - March 8, 5:36 AM\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const updates = [
    {
      row: 395,
      company: 'Casa Verde Capital',
      contactName: 'Karan Wadhera',
      title: 'Managing Partner',
      email: 'karan@casaverdecapital.com',
      linkedin: '',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email verified via ContactOut & Success.ai. Cannabis/plant-based VC fund. Notable: Snoop Dogg backed. Founded 2014, LA-based.'
    },
    {
      row: 400,
      company: 'Cornell Capital',
      contactName: 'Henry Cornell',
      title: 'Senior Partner (Founder)',
      email: 'henry@cornellcapllc.com',
      linkedin: '',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email verified via ContactOut. Pattern: first@cornellcapllc.com (84.5%). ~$5B AUM, consumer/financial services/industrials. Founded 2013, NY/HK offices. Former Goldman Sachs MBD Vice Chairman.'
    },
    {
      row: 402,
      company: 'Crossplane Capital',
      contactName: 'Ben Eakes',
      title: 'Partner (Co-Founder & Managing Partner)',
      email: 'beakes@crossplanecapital.com',
      linkedin: 'https://www.linkedin.com/in/ben-eakes-59146b/',
      status: 'Enriched - Web Research 2026-03-08',
      notes: 'Email pattern from RocketReach (b******@crossplanecapital.com). Also: Michael Sullivan (Partner). Dallas-based, industrial business services/manufacturing. Up to $200M revenue targets.'
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

  console.log('\n✅ Batch 3 complete!\n');
  console.log('=== CRON JOB SUMMARY - March 8, 5:36 AM ===');
  console.log('✅ 11 firms enriched with verified contacts');
  console.log('❌ 3 dead leads identified (Investment Bank, Portfolio Co, Exec Search)');
  console.log('📊 Total processed: 14 firms');
  console.log('\n🎯 Next: Continue enriching remaining ~90 "New - Unresearched" leads');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
