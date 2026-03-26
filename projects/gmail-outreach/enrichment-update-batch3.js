const { google } = require('googleapis');

async function updateEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch 3: Final enrichments
  const updates = [
    {
      row: 283,
      firm: 'Garnett Station Partners',
      website: 'https://garnettstation.com',
      contact: 'Matt Perelman & Alex Sloane',
      title: 'Managing Partners & Co-Founders',
      email: 'perelman@garnettstation.com',
      linkedin: 'https://www.linkedin.com/in/matt-perelman',
      status: 'Enriched',
      notes: 'Co-Founders & Managing Partners verified from garnettstation.com/team. Email pattern [last]@garnettstation.com verified via RocketReach (96.6%). $3.5B AUM. Founded 2013. Alex: sloane@garnettstation.com. (2026-03-16 cron)'
    },
    {
      row: 300,
      firm: 'Avante Capital Partners',
      website: 'https://avantecap.com',
      contact: 'Chaz Cocuzza',
      title: 'Managing Director',
      email: 'chaz@avantecap.com',
      linkedin: 'https://www.linkedin.com/in/chaz-cocuzza',
      status: 'Enriched',
      notes: 'Managing Director verified from avantecap.com/our-team. Email pattern [first]@avantecap.com verified via RocketReach (81%). Focus on capital formation, deal sourcing, investment execution. Alternative: Leslie Harman (Founder & Chairman, leslie@avantecap.com). (2026-03-16 cron)'
    },
    {
      row: 285,
      firm: 'Sentinel Capital Partners',
      website: 'https://www.sentinelpartners.com',
      contact: 'Patrick Knise',
      title: 'Managing Director',
      email: 'knise@sentinelpartners.com',
      linkedin: 'https://www.linkedin.com/in/patrick-knise',
      status: 'Enriched',
      notes: 'Managing Director verified from sentinelpartners.com/member. Email pattern [last]@sentinelpartners.com verified via RocketReach (94.9%) and LeadIQ (96%). Joined 2014 as Associate, promoted to MD. Ex-Macquarie Capital. (2026-03-16 cron)'
    }
  ];
  
  // Apply each update
  for (const update of updates) {
    const range = `Sheet1!A${update.row}:K${update.row}`;
    
    // Build the row data array
    const values = [[
      update.firm,
      update.website || '', // Column B - website
      update.contact,
      update.title,
      update.email,
      '', // Column F - sometimes another field
      update.linkedin,
      update.status,
      update.notes,
      '', // Last contact
      '' // Next step
    ]];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✅ Updated Row ${update.row}: ${update.firm} - ${update.contact}`);
    } catch (error) {
      console.error(`❌ Failed to update Row ${update.row}:`, error.message);
    }
  }
  
  console.log('\n✅ Enrichment batch 3 complete!');
}

updateEnrichment().catch(console.error);
