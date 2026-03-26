const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment data - verified contacts from research
  const enrichments = [
    {
      row: 18, // Monomoy Capital Partners
      data: {
        contactName: 'Lee Mlotek',
        title: 'Managing Director',
        email: 'lmlotek@mcpfunds.com',
        linkedin: 'https://www.linkedin.com/in/lee-mlotek-344a795',
        status: 'Enriched',
        notes: 'Apollo verified - 2026-03-04'
      }
    },
    {
      row: 11, // KSL Capital Partners
      data: {
        contactName: 'Kirk Adamson',
        title: 'Partner, Managing Director',
        email: 'kirk.adamson@kslcapital.com',
        linkedin: 'https://www.linkedin.com/in/kirk-adamson',
        status: 'Enriched',
        notes: 'Website team page - 2026-03-04'
      }
    },
    {
      row: 28, // ParkerGale Capital
      data: {
        contactName: 'Ryan Milligan',
        title: 'Partner',
        email: 'ryan@parkergale.com',
        linkedin: 'https://www.linkedin.com/in/ryanmilligan',
        status: 'Enriched',
        notes: 'Website verified - 2026-03-04'
      }
    },
    {
      row: 26, // MPE Partners
      data: {
        contactName: 'Andrew Weinstein',
        title: 'Managing Partner',
        email: 'aweinstein@mpepartners.com',
        linkedin: 'https://www.linkedin.com/in/andrew-weinstein-mpe',
        status: 'Enriched',
        notes: 'Website team page - 2026-03-04'
      }
    },
    {
      row: 8, // Jump Capital
      data: {
        contactName: 'Mike McMahon',
        title: 'Co-Founder and Partner',
        email: 'mike@jumpcap.com',
        linkedin: 'https://www.linkedin.com/in/michael-mcmahon-jump',
        status: 'Enriched',
        notes: 'Website verified - 2026-03-04'
      }
    }
  ];
  
  // Update each row
  for (const item of enrichments) {
    const values = [[
      item.data.contactName,    // C
      item.data.title,           // D
      item.data.email,           // E
      '',                        // F (skip Website_1)
      item.data.linkedin,        // G
      '',                        // H (skip Sectors)
      '',                        // I (skip Notes_1)
      item.data.status           // J
    ]];
    
    const range = `Sheet1!C${item.row}:J${item.row}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    });
    
    console.log(`✅ Updated row ${item.row}: ${item.data.contactName}`);
  }
  
  console.log(`\n🎯 Enriched ${enrichments.length} leads`);
}

enrichSheet().catch(console.error);
