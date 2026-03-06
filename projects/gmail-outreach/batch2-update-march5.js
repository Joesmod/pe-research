const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  const updates = [
    {
      row: 465, // Fisher Lynch Capital
      contactName: 'Marshall Bartlett',
      title: 'Managing Director',
      email: 'mbartlett@fisherlynch.com',
      linkedin: 'https://www.linkedin.com/in/marshall-bartlett-60ab33a4',
      notes: 'Email pattern from RocketReach. $2B AUM co-investment specialist. Also: Brett Fisher (Founder)',
      status: 'Partial',
      date: '2026-03-05'
    },
    {
      row: 458, // CAZ Investments
      contactName: 'Mark Wade',
      title: 'Partner',
      email: 'mwade@cazinvestments.com',
      linkedin: 'https://www.linkedin.com/company/caz-investments',
      notes: 'Email pattern from RocketReach. $10.3B AUM PE allocator. Also: Matt Lindholm (mlindholm@cazinvestments.com)',
      status: 'Partial',
      date: '2026-03-05'
    },
    {
      row: 417, // Juno Capital Partners
      contactName: 'Sherwin Jiang',
      title: 'Managing Director',
      email: 'sjiang@junocapitalpartners.com',
      linkedin: 'https://www.linkedin.com/in/sherwin-jiang-16315022',
      notes: 'Email pattern from RocketReach. Media & entertainment investment bank. Finalis-backed.',
      status: 'Partial',
      date: '2026-03-05'
    },
    {
      row: 18, // Gryphon Investors
      contactName: 'R. David Andrews',
      title: 'Founder & Co-CEO',
      email: 'dandrews@gryphoninvestors.com',
      linkedin: 'https://www.linkedin.com/company/gryphon-investors',
      notes: 'Email pattern inferred from company domain. Co-CEO with Nicholas Orum. $9B+ AUM. Press: PRNewswire',
      status: 'Partial',
      date: '2026-03-05'
    }
  ];

  console.log(`Updating ${updates.length} rows in the sheet (Batch 2)...\n`);

  for (const update of updates) {
    const range = `Sheet1!C${update.row}:J${update.row}`;
    const values = [[
      update.contactName,
      update.title,
      update.email,
      update.website || '',
      update.linkedin,
      update.sectors || '',
      update.notes,
      update.status
    ]];

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Updated row ${update.row}: ${update.contactName} (${update.email})`);
    } catch (err) {
      console.error(`✗ Failed to update row ${update.row}:`, err.message);
    }
  }

  console.log('\n✅ Batch 2 update complete!');
  console.log('\nTotal enriched so far: 10 leads (4 full, 6 partial)');
}

updateSheet().catch(console.error);
