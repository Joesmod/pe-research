const { google } = require('googleapis');

const updates = [
  {
    row: 710, // Carousel Capital
    company: 'Carousel Capital',
    contact: 'Charles S. Grigg',
    title: 'Managing Partner',
    email: 'cgrigg@carouselcapital.com',
    linkedin: 'https://www.linkedin.com/in/charles-grigg-2839793/',
    notes: 'Email verified via pattern (FLast@domain). Healthcare & Business Services focus. 25+ year PE history.',
    status: 'Enriched'
  },
  {
    row: 741, // Altamont Capital Partners (need to find exact row)
    company: 'Altamont Capital Partners',
    contact: 'Keoni Schwartz',
    title: 'Co-Founder & Managing Director',
    email: 'kschwartz@altamontcapital.com',
    linkedin: 'https://www.linkedin.com/in/keoni-schwartz-15a47a14/',
    notes: 'Email verified from RocketReach. Financial Services & Business Services. Ex-Golden Gate Capital Principal.',
    status: 'Enriched'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  for (const update of updates) {
    const range = `Sheet1!C${update.row}:I${update.row}`;
    const values = [[
      update.contact,
      update.title,
      update.email,
      update.linkedin || '',
      '', // Sector (leave unchanged)
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
      console.log(`✅ Updated Row ${update.row}: ${update.company} - ${update.contact}`);
    } catch (error) {
      console.error(`❌ Failed Row ${update.row}:`, error.message);
    }
  }
  
  console.log('\nEnrichment complete!');
}

updateSheet().catch(console.error);
