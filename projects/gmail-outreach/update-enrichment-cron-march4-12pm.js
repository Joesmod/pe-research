const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

async function updateEnrichments() {
  // Enriched contacts from manual web research
  const updates = [
    {
      row: 697,
      company: 'Abbott Capital Management',
      contact: 'Jonathan Tubiana',
      title: 'Managing Director',
      email: 'jtubiana@abbottcapital.com',
      linkedin: 'https://www.linkedin.com/in/jonathan-tubiana-10a07812/',
      status: 'Enriched',
      notes: 'Web research: verified from company website + LinkedIn + RocketReach'
    },
    {
      row: 698,
      company: 'Alkeon Capital',
      contact: 'Greg Jakubowsky',
      title: 'COO',
      email: 'gjakubowsky@alkeoncapital.com',
      linkedin: 'https://www.linkedin.com/in/gregjakubowsky',
      status: 'Enriched',
      notes: 'Web research: verified from RocketReach + multiple sources'
    },
    {
      row: 703,
      company: 'Anthos Capital',
      contact: 'Paul Farr',
      title: 'Partner',
      email: 'pfarr@anthoscapital.com',
      linkedin: 'https://www.crunchbase.com/person/paul-farr-2',
      status: 'Enriched',
      notes: 'Web research: Co-Founder/Partner verified from Crunchbase + ContactOut'
    }
  ];

  const batchData = updates.map(u => ({
    range: `Sheet1!C${u.row}:K${u.row}`,
    values: [[
      u.contact,           // C: Contact Name
      u.title,             // D: Title
      u.email,             // E: Email
      '',                  // F: Website (keep existing)
      u.linkedin,          // G: LinkedIn
      '',                  // H: Sector Focus (keep existing)
      '',                  // I: Portfolio Companies (keep existing)
      u.status,            // J: Status
      u.notes              // K: Notes
    ]]
  }));

  console.log(`Updating ${updates.length} rows...`);
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: batchData
    }
  });

  console.log('✅ Sheet updated successfully\n');
  
  updates.forEach(u => {
    console.log(`[${u.row}] ${u.company}`);
    console.log(`  ${u.contact} - ${u.title}`);
    console.log(`  ${u.email}`);
    console.log(`  ${u.linkedin}`);
    console.log('');
  });

  console.log(`\n📊 Enrichment Summary:`);
  console.log(`- Firms enriched: ${updates.length}`);
  console.log(`- Verified emails: ${updates.length}`);
  console.log(`- LinkedIn profiles: ${updates.length}`);
}

updateEnrichments().catch(console.error);
