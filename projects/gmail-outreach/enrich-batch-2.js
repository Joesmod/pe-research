const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Second batch of enrichments
  const enrichments = [
    {
      row: 14, // Lightview Capital
      data: {
        contactName: 'Richard Erickson',
        title: 'Co-Founder & Managing Director',
        email: 'rerickson@lightviewcapital.com',
        linkedin: 'https://www.linkedin.com/in/richard-erickson-lightview',
        status: 'Enriched',
        notes: 'RocketReach verified - 2026-03-04'
      }
    },
    {
      row: 13, // LFM Capital
      data: {
        contactName: 'Dan Shockley',
        title: 'Managing Director',
        email: 'dshockley@lfmcapital.com',
        linkedin: 'https://www.linkedin.com/in/dan-shockley-lfm',
        status: 'Enriched',
        notes: 'RocketReach verified - 2026-03-04'
      }
    },
    {
      row: 20, // New Heritage Capital
      data: {
        contactName: 'Mark Jrolf',
        title: 'Co-Founder & Managing Senior Partner',
        email: 'mjrolf@newheritagecapital.com',
        linkedin: 'https://www.linkedin.com/in/mark-jrolf',
        status: 'Enriched',
        notes: 'Website verified - 2026-03-04'
      }
    },
    {
      row: 22, // North Castle Partners
      data: {
        contactName: 'Chip Baird',
        title: 'Founder & Managing Partner',
        email: 'cbaird@northcastlepartners.com',
        linkedin: 'https://www.linkedin.com/in/chip-baird',
        status: 'Enriched',
        notes: 'RocketReach verified - 2026-03-04'
      }
    },
    {
      row: 23, // Paine Schwartz Partners
      data: {
        contactName: 'Kevin Schwartz',
        title: 'CEO and Managing Partner',
        email: 'kschwartz@paineschwartz.com',
        linkedin: 'https://www.linkedin.com/in/kevin-schwartz-76a01b92',
        status: 'Enriched',
        notes: 'ContactOut verified - 2026-03-04'
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
  
  console.log(`\n🎯 Enriched ${enrichments.length} leads in batch 2`);
}

enrichSheet().catch(console.error);
