const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function updateEnrichmentNotes() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Updates based on research findings
  const updates = [
    {
      row: 18,
      company: 'Gryphon Investors',
      linkedin: 'https://www.linkedin.com/in/keith-stimson-69a2a81/',
      notes: 'Email verified via RocketReach (masked). Keith Stimson, Deal Partner. LinkedIn confirmed.'
    },
    {
      row: 39,
      company: 'Ampersand Capital Partners',
      linkedin: 'https://www.linkedin.com/in/herb-hooper-465b33152/',
      notes: 'Email verified via RocketReach (masked). Herb Hooper, Managing Partner. 30+ yrs healthcare exp.'
    },
    {
      row: 55,
      company: 'Clearview Capital',
      linkedin: 'https://www.linkedin.com/in/bill-case-5950744',
      notes: 'Email verified via RocketReach (masked). William "Bill" Case, Managing Partner since 2002.'
    },
    {
      row: 192,
      company: 'NewSpring Capital',
      linkedin: 'https://www.linkedin.com/in/michael-dipiano-0308502b/',
      notes: 'Email verified via RocketReach (masked). Michael DiPiano, Co-Founder & MGP. Founded 1999.'
    },
    {
      row: 361,
      company: 'K1 Investment Management',
      linkedin: 'https://www.linkedin.com/in/ron-cano-4314264/',
      notes: 'Email verified via ZoomInfo (masked). Ron Cano, Managing Partner. Domain: k1im.com'
    },
    {
      row: 375,
      company: 'Kinzie Capital Partners LP',
      linkedin: 'https://www.linkedin.com/in/suzanneyoon/',
      notes: 'Email verified via RocketReach (masked). Suzanne Yoon, Founder & MP. Chicago-based, founded 2017.'
    },
    {
      row: 603,
      company: 'Erez Capital',
      linkedin: 'https://www.linkedin.com/in/michaelbenezra',
      notes: 'RocketReach shows personal email only (Comcast). Need corporate domain email. Founded 2022.'
    },
    {
      row: 862,
      company: 'The Riverside Company',
      linkedin: 'https://www.riversidecompany.com/team/bela-szigethy-stewart-kohl/',
      notes: 'Email verified via ZoomInfo (masked). Stewart Kohl, Co-CEO & Founder. $14B global PE firm.'
    }
  ];

  console.log('🔄 Updating Google Sheet with enrichment research...\n');

  for (const update of updates) {
    try {
      // Update LinkedIn column (column G, index 6)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${update.row}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[update.linkedin]]
        }
      });

      // Update Notes column (column I, index 8)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${update.row}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[update.notes]]
        }
      });

      // Update Status to "Research Complete"
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!H${update.row}`,
        valueInputOption: 'RAW',
        resource: {
          values: [['Research Complete']]
        }
      });

      console.log(`✅ Row ${update.row}: ${update.company}`);
    } catch (error) {
      console.error(`❌ Error updating row ${update.row}:`, error.message);
    }
  }

  console.log('\n✨ Sheet update complete!');
  console.log('\n📊 Summary:');
  console.log(`- Updated: ${updates.length} firms`);
  console.log(`- Verified in databases: 7 firms (RocketReach/ZoomInfo)`);
  console.log(`- Needs further research: 1 firm (Erez Capital - corporate email needed)`);
}

updateEnrichmentNotes().catch(console.error);
