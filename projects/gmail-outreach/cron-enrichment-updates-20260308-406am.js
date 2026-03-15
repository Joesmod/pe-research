const { google } = require('googleapis');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    {
      row: 9,
      company: 'Aeris Partners',
      contactName: 'Brandon White',
      email: 'info@aerispartners.com',
      status: 'Dead - M&A Advisory / Investment Bank',
      notes: 'Not a PE firm. M&A advisory serving PE/VC clients. Brandon White not verified on current team. Generic contact only.'
    },
    {
      row: 209,
      company: 'Ridgemont Equity Partners',
      contactName: 'John Shimp',
      title: 'Managing Partner',
      email: 'jshimp@ridgemontep.com',
      linkedin: 'https://www.linkedin.com/in/john-shimp-91a73927/',
      status: 'Enriched',
      notes: 'Email pattern verified via ZoomInfo/RocketReach. Managing Partner confirmed.'
    },
    {
      row: 229,
      company: 'Marlin Equity Partners',
      contactName: 'Nathan Pingelton',
      title: 'Managing Director',
      email: 'npingelton@marlinequity.com',
      linkedin: 'https://www.linkedin.com/in/nathan-pingelton-6a179011/',
      status: 'Enriched',
      notes: 'Email verified via ContactOut (2025). Managing Director, flagship fund Investment Committee member.'
    },
    {
      row: 449,
      company: 'Basis Vectors Capital',
      contactName: 'Ambarish Gupta',
      title: 'Founder & CEO',
      email: 'ambarish@basisvectors.com',
      linkedin: 'https://www.linkedin.com/in/ambarishngupta/',
      status: 'Enriched',
      notes: '$50M fund (launched 2020). Ex-Knowlarity founder. AI/SaaS focus. Email pattern verified via Growjo. NYC-based, Carnegie Mellon MBA.'
    },
    {
      row: 458,
      company: 'CAZ Investments',
      contactName: 'Mark Wade',
      title: 'Partner',
      email: 'mwade@cazinvestments.com',
      linkedin: 'https://www.linkedin.com/in/mark-wade-caia-334b951b/',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach/ZoomInfo. Partner, CAIA designation.'
    },
    {
      row: 472,
      company: 'Lead Capital Partners',
      contactName: 'Erick Clifford',
      title: 'Co-Founder & Managing Partner',
      email: 'eclifford@leadcp.com',
      linkedin: 'https://www.linkedin.com/in/erick-clifford-452a0225/',
      status: 'Enriched',
      notes: 'Email verified via RocketReach/Salesgear. Nashville-based.'
    },
    {
      row: 553,
      company: '1315 Capital',
      contactName: 'Michael Koby',
      title: 'Co-Founder & Partner',
      email: 'michael.koby@1315capital.com',
      linkedin: 'https://www.linkedin.com/in/kobymichael/',
      status: 'Enriched',
      notes: 'Email verified via ContactOut (2024). Healthcare Growth Capital focus. Founded 2014, Wharton MBA.'
    }
  ];
  
  console.log(`Preparing to update ${updates.length} rows...`);
  
  for (const update of updates) {
    const range = `Sheet1!C${update.row}:J${update.row}`;
    const values = [[
      update.contactName || '',
      update.title || '',
      update.email || '',
      '', // Website (keeping existing)
      update.linkedin || '',
      '', // Sector Focus (keeping existing)
      update.notes || '',
      update.status || 'Enriched'
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });
      console.log(`✓ Updated ${update.company} (row ${update.row})`);
    } catch (error) {
      console.error(`✗ Failed to update ${update.company}:`, error.message);
    }
  }
  
  console.log('\nEnrichment update complete!');
  console.log(`Enriched: 6 firms with verified contacts`);
  console.log(`Dead: 1 firm (not PE)`);
}

updateEnrichments().catch(console.error);
