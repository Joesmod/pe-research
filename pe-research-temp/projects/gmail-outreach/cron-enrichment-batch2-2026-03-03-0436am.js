const { google } = require('googleapis');

const updates = [
  {
    row: 901,
    company: "Peak Rock Capital",
    contact: "Anthony DiSimone",
    title: "Chief Executive Officer",
    email: "adisimone@peakrockcapital.com",
    linkedin: "https://www.linkedin.com/in/anthony-disimone",
    status: "Enriched",
    notes: "Email pattern from Growjo. Middle-market PE, North America and Europe focus. Source: Growjo + Bloomberg 2026-03-03"
  },
  {
    row: 902,
    company: "Altamont Capital Partners",
    contact: "Keoni Schwartz",
    title: "Co-Founder and Managing Director",
    email: "kschwartz@altamontcapital.com",
    linkedin: "https://www.linkedin.com/in/keoni-schwartz-15a47a14/",
    status: "Enriched",
    notes: "Email verified via ContactOut. Leads Financial Services and Business Services verticals. Ex-Golden Gate Capital. $4.5B AUM. Alt contact: Jesse Rogers, Co-Founder/Chairman, jrogers@altamontcapital.com. Source: ContactOut + Altamont website 2026-03-03"
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  console.log(`Updating ${updates.length} rows...`);
  
  for (const update of updates) {
    const range = `Sheet1!B${update.row}:J${update.row}`;
    const values = [[
      update.contact,
      update.title,
      update.email,
      '', // website (keep existing)
      update.linkedin,
      '', // sector focus (keep existing)
      '', // portfolio (keep existing)
      update.status,
      '' // last contacted (keep existing)
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Row ${update.row}: ${update.company} - ${update.contact}`);
    } catch (error) {
      console.error(`✗ Row ${update.row}: ${error.message}`);
    }
  }

  console.log('\nEnrichment batch 2 complete!');
  console.log(`Enriched: ${updates.length} entries`);
}

updateSheet().catch(console.error);
