const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const updates = [
  // The Riverside Company
  {
    row: 937,
    values: [
      'The Riverside Company',
      'https://www.riversidecompany.com',
      'Stewart Kohl',
      'Co-Founder & Co-CEO',
      'skohl@riversidecompany.com',
      'https://www.riversidecompany.com',
      'https://www.linkedin.com/in/stewart-kohl',
      'Business Services, Healthcare, Industrial',
      'Global PE firm, 1000+ investments, 350+ employees, $10B+ AUM. Founded 1988. Email pattern from ZoomInfo.',
      'Enriched'
    ]
  },
  // Svoboda Capital Partners
  {
    row: 963,
    values: [
      'Svoboda Capital Partners',
      'https://svoco.com',
      'Tom Brooker',
      'Managing Director & Operating Partner',
      'tbrooker@svoco.com',
      'https://svoco.com',
      'https://www.linkedin.com/company/svoboda-capital-partners-llc',
      'Business Services, Logistics, Industrial Services',
      'Chicago-based. $400M+ AUM. Professional services, industrial services, logistics. Tom Brooker is Managing Director per RocketReach.',
      'Enriched'
    ]
  },
  // TAP Advisors - Mark as Dead
  {
    row: 682,
    values: [
      'TAP Advisors',
      'http://www.tapadvisors.com',
      'David undefined',
      'Partner',
      '',
      'http://www.tapadvisors.com',
      'http://www.linkedin.com/company/tap-advisors',
      '',
      'M&A advisory / investment banking firm. Not a direct PE investor.',
      'Dead - Not PE Firm'
    ]
  },
  // HSP - Mark as Dead
  {
    row: 621,
    values: [
      'HSP - Henkel Search Partners',
      'http://www.henkelsp.com',
      'Alyson undefined',
      'Chief Financial Officer',
      '',
      'http://www.henkelsp.com',
      '',
      '',
      'Executive search/recruiting firm for PE industry. Not an investor.',
      'Dead - Not PE'
    ]
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    const range = `A${update.row}:J${update.row}`;
    console.log(`Updating row ${update.row}: ${update.values[0]}`);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: [update.values]
      }
    });
  }
  
  console.log(`\nUpdated ${updates.length} firms in the sheet.`);
})();
