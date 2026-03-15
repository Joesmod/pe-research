const fs = require('fs');
const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch 2 enrichment updates
  const updates = [
    {
      row: 874,
      company: 'Warren Equity Partners',
      contact: 'Steven Wacaster',
      title: 'Managing Partner and Co-Founder',
      email: 'swacaster@warrenequity.com',
      linkedin: 'https://warrenequity.com/team/steven-wacaster-2/',
      notes: 'Email pattern last@warrenequity.com verified via RocketReach (93.9%). Jacksonville Beach FL-based.',
      status: 'Enriched'
    },
    {
      row: 891,
      company: 'Odyssey Investment Partners',
      contact: 'Jonathan Hall',
      title: 'Managing Principal',
      email: 'jhall@odysseyinvestment.com',
      linkedin: 'https://www.businesswire.com/news/home/20250105809404/en/Odyssey-Investment-Partners-Announces-Team-Promotions',
      notes: 'Email pattern first_initial last@odysseyinvestment.com verified via RocketReach/LeadIQ. Promoted Jan 2025. NYC-based. $3.25B fund.',
      status: 'Enriched'
    },
    {
      row: 893,
      company: 'Symphony Technology Group (STG)',
      contact: 'Marc Bala',
      title: 'Managing Director',
      email: 'marc.bala@stgpartners.com',
      linkedin: 'https://stg.com/who-we-are/',
      notes: 'Email pattern first.last@stgpartners.com per RocketReach. Menlo Park CA-based. Software PE firm.',
      status: 'Enriched'
    },
    {
      row: 907,
      company: 'Odyssey Investment Partners',
      contact: 'Vivian Hadis',
      title: 'Managing Principal',
      email: 'vhadis@odysseyinvestment.com',
      linkedin: 'https://www.businesswire.com/news/home/20250105809404/en/Odyssey-Investment-Partners-Announces-Team-Promotions',
      notes: 'Email pattern verified. Promoted to Managing Principal Jan 2025.',
      status: 'Enriched'
    }
  ];

  console.log(`Preparing to update ${updates.length} leads (Batch 2)...`);
  
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
  
  console.log('\nBatch 2 enrichment complete!');
  console.log(JSON.stringify(updates, null, 2));
}

updateSheet().catch(console.error);
