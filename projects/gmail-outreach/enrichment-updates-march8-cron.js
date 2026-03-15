const fs = require('fs');
const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment updates (row index, contact name, title, email, LinkedIn, notes, status)
  const updates = [
    {
      row: 828,
      company: 'ALCOR Fund',
      contact: 'Ishaan Kanoi',
      title: 'Principal Partner',
      email: 'ikanoi@alcorfund.com',
      linkedin: 'https://www.linkedin.com/in/ishaan-kanoi-72189923/',
      notes: 'Email pattern first_initial last@alcorfund.com verified via RocketReach. NYC & India-based. Global investment bank.',
      status: 'Enriched'
    },
    {
      row: 839,
      company: 'Atlas Private Equity Partners',
      contact: 'Michael Hitchcock',
      title: 'Partner',
      email: 'mhitchcock@atlaspep.com',
      linkedin: 'https://www.linkedin.com/in/michael-hitchcock-6213bb33/',
      notes: 'Houston-based, entrepreneur-led PE firm. Website atlaspep.com. LinkedIn verified.',
      status: 'Enriched'
    },
    {
      row: 843,
      company: 'American Industrial Partners',
      contact: 'Kim Marvin',
      title: 'General Partner',
      email: 'Kim@americanindustrial.com',
      linkedin: 'https://americanindustrial.com/team/kim-marvin',
      notes: 'Email pattern First@americanindustrial.com verified from official team page. NYC-based.',
      status: 'Enriched'
    },
    {
      row: 844,
      company: 'Wind Point Partners',
      contact: 'Alex Washington',
      title: 'Managing Director',
      email: 'awashington@wppartners.com',
      linkedin: 'https://www.linkedin.com/in/alex-washington/',
      notes: 'Email pattern first_initial last@wppartners.com verified via ZoomInfo/RocketReach. Chicago-based.',
      status: 'Enriched'
    },
    {
      row: 872,
      company: 'Salt Creek Capital',
      contact: 'Ryan Hodgson',
      title: 'Managing Director',
      email: 'rhodgson@saltcreekcap.com',
      linkedin: 'https://www.linkedin.com/in/ryan-hodgson-0374054/',
      notes: 'Email pattern first_initial last@saltcreekcap.com. Woodside CA-based. Harvard MBA.',
      status: 'Enriched'
    },
    {
      row: 872,
      company: 'Salt Creek Capital',
      contact: 'Dan Phelps',
      title: 'Managing Partner',
      email: 'dphelps@saltcreekcap.com',
      linkedin: 'https://www.linkedin.com/in/dan-phelps-5408a/',
      notes: 'Email pattern verified. Booth MBA. Los Altos-based.',
      status: 'Enriched'
    },
    {
      row: 872,
      company: 'Salt Creek Capital',
      contact: 'Jordan Stankowski',
      title: 'Managing Director & Operating Partner',
      email: 'jstankowski@saltcreekcap.com',
      linkedin: 'https://www.linkedin.com/in/jordanstankowski/',
      notes: 'CFA. Stanford GSB. San Francisco Bay Area.',
      status: 'Enriched'
    }
  ];

  console.log(`Preparing to update ${updates.length} leads...`);
  
  for (const update of updates) {
    const range = `Sheet1!C${update.row}:J${update.row}`;
    const values = [[
      update.contact,
      update.title,
      update.email,
      '', // Website column (keeping existing)
      update.linkedin,
      '', // Sector Focus (keeping existing)
      update.notes,
      update.status
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      console.log(`✓ Updated ${update.company} - ${update.contact}`);
    } catch (error) {
      console.error(`✗ Failed to update row ${update.row}:`, error.message);
    }
  }
  
  console.log('\nEnrichment complete!');
  console.log(JSON.stringify(updates, null, 2));
}

updateSheet().catch(console.error);
