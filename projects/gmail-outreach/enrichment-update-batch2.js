const { google } = require('googleapis');

async function updateEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Batch 2: Additional enrichments
  const updates = [
    {
      row: 259,
      firm: 'BayBoston Capital',
      website: 'https://bayboston.com',
      contact: 'Carlos M. Garcia',
      title: 'Founder & Managing Partner',
      email: 'carlos@bayboston.com',
      linkedin: 'https://www.linkedin.com/in/carlos-garcia-94395878',
      status: 'Enriched',
      notes: 'Founder & Managing Partner verified from CBInsights + team page. Email pattern [first]@bayboston.com verified via ContactOut. Financial services PE focused on tech, banking & fintech in US and Latin America. Ex-Banco Santander senior exec. (2026-03-16 cron)'
    },
    {
      row: 276,
      firm: 'Harkness Capital Partners',
      website: 'https://www.harknesscapital.com',
      contact: 'Ted Dardani',
      title: 'Founding Partner',
      email: 'tdardani@harknesscapital.com',
      linkedin: 'https://www.linkedin.com/in/ted-dardani',
      status: 'Enriched',
      notes: 'Founding Partner & Investment Committee member verified from harknesscapital.com/team. Email pattern [first_initial][last]@harknesscapital.com verified via RocketReach (97%). 25+ years PE investor in services. Ex-Oak Hill Capital, DB Capital, McKinsey. (2026-03-16 cron)'
    },
    {
      row: 305,
      firm: 'Bertram Capital',
      website: 'https://www.bcap.com',
      contact: 'Jeff Drazan',
      title: 'Managing Partner',
      email: 'jdrazan@bcap.com',
      linkedin: 'https://www.linkedin.com/in/jeff-drazan',
      status: 'Enriched',
      notes: 'Managing Partner verified from bcap.com news releases. Email pattern [first_initial][last]@bcap.com verified via RocketReach (92.9%) and LeadIQ (91%). Tech-enabled services PE. $500M+ fund closed. (2026-03-16 cron)'
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
  
  console.log('\n✅ Enrichment batch 2 complete!');
}

updateEnrichment().catch(console.error);
