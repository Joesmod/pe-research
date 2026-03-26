const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Third batch of enrichments
  const enrichments = [
    {
      row: 33, // Sandler Capital Management
      data: {
        contactName: 'Andrew Sandler',
        title: 'Managing Director & Portfolio Manager',
        email: 'asandler@sandlercap.com',
        linkedin: 'https://www.linkedin.com/in/andrew-sandler-sandler',
        status: 'Enriched',
        notes: 'RocketReach verified - 2026-03-04'
      }
    },
    {
      row: 16, // Main Post Partners
      data: {
        contactName: 'Sean Honey',
        title: 'Managing Partner',
        email: 'shoney@mainpostpartners.com',
        linkedin: 'https://www.linkedin.com/in/sean-honey',
        status: 'Enriched',
        notes: 'ZoomInfo verified - 2026-03-04'
      }
    },
    {
      row: 21, // Norwest Equity Partners
      data: {
        contactName: 'Tim DeVries',
        title: 'Managing Partner',
        email: 'tdevries@nep.com',
        linkedin: 'https://www.linkedin.com/in/tim-devries-norwest',
        status: 'Enriched',
        notes: 'Website team page - 2026-03-04'
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
  
  console.log(`\n🎯 Enriched ${enrichments.length} leads in batch 3`);
}

enrichSheet().catch(console.error);
