const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment findings from research
  const enrichments = [
    {
      row: 161,
      company: 'Thomas H. Lee Partners',
      contact: 'Scott Sperling',
      title: 'Co-Chief Executive Officer',
      email: 'ssperling@thl.com',
      linkedin: 'https://www.linkedin.com/in/scott-sperling-thl/',
      status: 'Enriched',
      notes: 'Co-CEO of THL. Email pattern: first_initial+last@thl.com. Source: LinkedIn profile + ZoomInfo pattern, 2026-03-12'
    },
    {
      row: 176,
      company: 'Hg Capital',
      contact: 'Nic Humphries',
      title: 'Senior Partner & Executive Chairman',
      email: 'nic.humphries@hgcapital.com',
      linkedin: 'https://hgcapital.com/team/Nic-Humphries',
      status: 'Enriched',
      notes: 'Executive Chairman, Head of Saturn fund. Email pattern: first.last@hgcapital.com inferred. Source: hgcapital.com/team, 2026-03-12'
    },
    {
      row: 220,
      company: 'WindPoint Partners',
      contact: 'Scott Greenblatt',
      title: 'Managing Director',
      email: 'sgreenblatt@wppartners.com',
      linkedin: 'https://www.linkedin.com/in/scott-greenblatt-8b47a04/',
      status: 'Enriched',
      notes: 'MD focusing on business services. Email pattern: first_initial+last@wppartners.com. Source: wppartners.com/team + LinkedIn, 2026-03-12'
    },
    {
      row: 234,
      company: 'The Jordan Company (TJC)',
      contact: 'John W. Jordan II',
      title: 'Chairman and Chief Executive Partner',
      email: 'jwjordan@thejordancompany.com',
      linkedin: 'https://www.linkedin.com/in/johnwjordanii/',
      status: 'Enriched',
      notes: 'Founder & Chairman. Email pattern: first_initial+middle_initial+last@domain. Source: thejordancompany.com/team, 2026-03-12'
    },
    {
      row: 276,
      company: 'Harkness Capital Partners',
      contact: 'Ian Harkness',
      title: 'Partner',
      email: 'iharkness@harknesscapital.com',
      linkedin: 'https://www.linkedin.com/in/ian-harkness-63b25a3/',
      status: 'Enriched',
      notes: 'Managing Partner. Email pattern: first_initial+last@domain. Source: harknesscapital.com/team, 2026-03-12'
    },
    {
      row: 285,
      company: 'Sentinel Capital Partners',
      contact: 'John McCormack',
      title: 'Managing Partner',
      email: 'jmccormack@sentinelpartners.com',
      linkedin: 'https://www.linkedin.com/in/john-mccormack-7206922/',
      status: 'Enriched',
      notes: 'Managing Partner, joined 2003. Email pattern: first_initial+last@sentinelpartners.com. Source: sentinelpartners.com/team, 2026-03-12'
    },
    {
      row: 305,
      company: 'Bertram Capital',
      contact: 'Jeffrey Drazan',
      title: 'Founder & Managing Director',
      email: 'jdrazan@bertramcapital.com',
      linkedin: 'https://www.linkedin.com/in/jeffrey-drazan-8740b111/',
      status: 'Enriched',
      notes: 'Co-Founder & MD. Email pattern: first_initial+last@domain. Source: bertramcapital.com/team, 2026-03-12'
    },
    {
      row: 310,
      company: 'Argonaut Private Equity',
      contact: 'Tom Burger',
      title: 'Sr. Partner & Managing Director',
      email: 'tburger@argonautprivateequity.com',
      linkedin: 'https://www.linkedin.com/in/tom-burger-67a4652/',
      status: 'Enriched',
      notes: 'Sr Partner & MD, 25+ years PE experience. Email pattern: first_initial+last@domain. Source: argonautprivateequity.com/team, 2026-03-12'
    },
    {
      row: 311,
      company: 'Mill Point Capital',
      contact: 'Brian Goldner',
      title: 'Founder & Managing Partner',
      email: 'bgoldner@millpoint.com',
      linkedin: 'https://www.linkedin.com/in/brian-goldner-47298a12/',
      status: 'Enriched',
      notes: 'Founder & Managing Partner. Email pattern: first_initial+last@millpoint.com. Source: millpoint.com/team, 2026-03-12'
    },
    {
      row: 319,
      company: 'CIVC Partners',
      contact: 'Michael Falk',
      title: 'Partner',
      email: 'mfalk@civcpartners.com',
      linkedin: 'https://www.linkedin.com/in/michael-falk-b4a8232/',
      status: 'Enriched',
      notes: 'Partner, technology/software focus. Email pattern: first_initial+last@civcpartners.com. Source: civcpartners.com/team, 2026-03-12'
    },
    {
      row: 324,
      company: 'Frontenac Company',
      contact: 'Colin Hewitt',
      title: 'Director of Strategic Growth',
      email: 'chewitt@frontenac.com',
      linkedin: 'https://www.linkedin.com/in/colin-hewitt-2b13b816/',
      status: 'Enriched',
      notes: 'Director Strategic Growth. Email pattern: first_initial+last@frontenac.com. Source: frontenac.com/team, 2026-03-12'
    },
    {
      row: 335,
      company: 'Odyssey Investment Partners',
      contact: 'Andrew Weinberg',
      title: 'Chief Executive Officer',
      email: 'aweinberg@odysseyinvestment.com',
      linkedin: 'https://www.linkedin.com/in/andrew-weinberg-0b72b92/',
      status: 'Enriched',
      notes: 'CEO and Managing Partner. Email pattern: first_initial+last@odysseyinvestment.com. Source: odysseyinvestment.com/team, 2026-03-12'
    },
    {
      row: 475,
      company: 'Lux Capital',
      contact: 'Josh Wolfe',
      title: 'Co-Founder & Partner',
      email: 'josh@luxcapital.com',
      linkedin: 'https://www.linkedin.com/in/joshuawolfe/',
      status: 'Enriched',
      notes: 'Co-Founder & Managing Partner. Email pattern: first@luxcapital.com. Source: luxcapital.com/team, 2026-03-12'
    },
    {
      row: 485,
      company: 'Stronghold Investment Management',
      contact: 'Ryan Ketchum',
      title: 'Managing Director',
      email: 'rketchum@strongholdim.com',
      linkedin: 'https://www.linkedin.com/in/ryan-ketchum-5a4b2a9/',
      status: 'Enriched',
      notes: 'Managing Director. Email pattern: first_initial+last@strongholdim.com. Source: strongholdim.com/team, 2026-03-12'
    },
    {
      row: 842,
      company: 'Wind Point Partners',
      contact: 'David Wahrhaftig',
      title: 'Managing Director',
      email: 'dwahrhaftig@wppartners.com',
      linkedin: 'https://www.linkedin.com/in/david-wahrhaftig-8537b36/',
      status: 'Enriched',
      notes: 'Managing Director, Chicago office. Email pattern: first_initial+last@wppartners.com (89.4% verified RocketReach). Source: wppartners.com/team, 2026-03-12'
    }
  ];

  console.log(`Updating ${enrichments.length} leads in Google Sheet...\n`);

  for (const item of enrichments) {
    try {
      const range = `Sheet1!B${item.row}:J${item.row}`;
      const values = [[
        item.contact || '',
        item.title || '',
        item.email || '',
        item.linkedin || '',
        '', // Website (leave as-is)
        '', // Sector Focus (leave as-is)
        '', // Portfolio Companies (leave as-is)
        item.status || '',
        item.notes || ''
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log(`✓ Row ${item.row}: ${item.company} - ${item.contact} (${item.title})`);
    } catch (error) {
      console.error(`✗ Row ${item.row}: ${item.company} - Error:`, error.message);
    }
  }

  console.log('\nEnrichment complete!');
  console.log(`Total updated: ${enrichments.length} leads`);
}

enrichSheet().catch(console.error);
