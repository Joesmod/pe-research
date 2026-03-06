const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  // Define updates (row numbers from earlier scan)
  const updates = [
    {
      row: 381, // Shoreline Equity Partners
      contactName: 'Zach Mittelmark',
      title: 'Vice President / Principal',
      email: 'mittelmark@shorelineequitypartners.com',
      linkedin: 'https://www.linkedin.com/company/shoreline-equity-partners',
      notes: 'Email from official press release. Also: Michael Bennan (mbennan@shorelineequitypartners.com)',
      status: 'Enriched',
      date: '2026-03-05'
    },
    {
      row: 444, // Washington Harbour Partners
      contactName: 'Mina Faltas',
      title: 'Founder & Chief Investment Officer',
      email: 'mfaltas@washingtonharbour.com',
      linkedin: 'https://www.linkedin.com/in/mina-faltas-washington-harbour-partners',
      notes: 'Source: ContactOut + official website. Previously Co-Founder of Nokota Management ($2.7B)',
      status: 'Enriched',
      date: '2026-03-05'
    },
    {
      row: 467, // Goode Partners
      contactName: 'Daniel Bonoff',
      title: 'Partner',
      email: 'dbonoff@goodepartners.com',
      linkedin: 'https://www.linkedin.com/in/daniel-bonoff',
      notes: 'Official team page. Also: David Oddi (Partner, doddi@goodepartners.com)',
      status: 'Enriched',
      date: '2026-03-05'
    },
    {
      row: 449, // Basis Vectors Capital
      contactName: 'Ambarish Gupta',
      title: 'Founder & CEO',
      email: 'agupta@basisvectors.com',
      linkedin: 'https://www.linkedin.com/in/ambarishngupta',
      notes: 'Email pattern from GrowJo. Vertical SaaS PE. $50M fund (2019). Founder of Knowlarity.',
      status: 'Partial',
      date: '2026-03-05'
    },
    {
      row: 472, // Lead Capital Partners
      contactName: 'Pryor Smartt',
      title: 'Managing Partner',
      email: 'psmartt@leadcp.com',
      linkedin: 'https://www.linkedin.com/in/pryor-smartt-7714892b',
      notes: 'Email pattern from RocketReach. Healthcare PE (lower middle market), Nashville TN',
      status: 'Partial',
      date: '2026-03-05'
    },
    {
      row: 489, // The Edgewater Funds
      contactName: 'Gregory Jones',
      title: 'Co-Founder & Partner',
      email: 'gregj@edgewaterfunds.com',
      linkedin: 'https://www.linkedin.com/in/gregory-jones-0b352521',
      notes: 'Source: ContactOut. $4B+ commitments. Also: Jim Gordon (Founder/Managing Partner)',
      status: 'Enriched',
      date: '2026-03-05'
    }
  ];

  console.log(`Updating ${updates.length} rows in the sheet...\n`);

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

  console.log('\n✅ Batch update complete!');
}

updateSheet().catch(console.error);
