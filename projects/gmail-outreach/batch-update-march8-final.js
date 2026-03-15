const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Updates for existing firms
const updates = [
  // The Riverside Company (row 937)
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
      'Global mid-market PE firm. $14B+ AUM. 960+ investments since 1988. 300+ employees. Email pattern FLast@riversidecompany.com per RocketReach.',
      'Enriched - 2026-03-08'
    ]
  },
  // Svoboda Capital Partners (row 963)
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
      'Chicago-based mid-market PE. Business services focus: professional services, industrial & commercial services, transportation & logistics. Tom Brooker per RocketReach.',
      'Enriched - 2026-03-08'
    ]
  },
  // TAP Advisors - Mark as Dead (row 682)
  {
    row: 682,
    values: [
      'TAP Advisors',
      'http://www.tapadvisors.com',
      '',
      '',
      '',
      'http://www.tapadvisors.com',
      'https://www.linkedin.com/company/tap-advisors',
      '',
      'Investment banking / M&A advisory firm. Not a direct PE investor.',
      'Dead - Not PE Firm'
    ]
  },
  // HSP - Mark as Dead (row 621)
  {
    row: 621,
    values: [
      'HSP - Henkel Search Partners',
      'http://www.henkelsp.com',
      '',
      '',
      '',
      'http://www.henkelsp.com',
      '',
      '',
      'Executive search/recruiting firm serving PE industry. Not an investor.',
      'Dead - Not PE'
    ]
  }
];

// New firms to append
const newFirms = [
  [
    'Abry Partners',
    'https://abry.com',
    'Jon Litinger',
    'Director, Business Development',
    'jlitinger@abry.com',
    'https://abry.com',
    'https://www.linkedin.com/company/abry-partners',
    'Media, Communications, Business Services, Information Services',
    'Boston-based mid-market PE firm. $7B+ AUM. Communications, media, information, and business services. Email pattern [first_initial][last]@abry.com per RocketReach.',
    'New - 2026-03-08'
  ],
  [
    'Edison Partners',
    'https://www.edisonpartners.com',
    'Chris Sugden',
    'Managing Partner & Chairman',
    'csugden@edisonpartners.com',
    'https://www.edisonpartners.com',
    'https://www.linkedin.com/in/christopherssugden',
    'Software, Healthcare IT, Fintech, Business Services',
    'Princeton-based growth equity firm. $1.7B AUM. Lower middle-market focus. Portfolio value $10B+. Named Top 50 PE Firm 2026. Email pattern FLast@edisonpartners.com per RocketReach.',
    'New - 2026-03-08'
  ],
  [
    'Gemspring Capital',
    'https://www.gemspring.com',
    'Clay Cole',
    'Managing Director',
    'clay@gemspring.com',
    'https://www.gemspring.com',
    'https://www.linkedin.com/company/gemspring-capital',
    'Business Services, Tech-Enabled Services, Software, Industrial',
    'Westport-based lower middle-market PE. $5.1B AUM. Flexible capital solutions. Clay Cole email verified on website. Business services and automotive sector lead.',
    'New - 2026-03-08'
  ]
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('=== UPDATING EXISTING FIRMS ===\n');
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
  
  console.log(`\n=== ADDING NEW FIRMS ===\n`);
  
  // Append new firms
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'A:J',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: newFirms
    }
  });
  
  newFirms.forEach(firm => {
    console.log(`Added: ${firm[0]} - ${firm[2]} (${firm[3]})`);
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updates.length} existing firms`);
  console.log(`Added: ${newFirms.length} new firms`);
  console.log(`Total enrichments: ${updates.length + newFirms.length}`);
})();
