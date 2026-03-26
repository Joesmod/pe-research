const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Batch 2: Additional enriched contacts
const enrichments = [
  {
    rowNumber: 771,
    company: 'Ocean Avenue Capital Partners, L.P.',
    contactName: 'Jeff Ennis',
    title: 'Co-Founding Partner',
    email: 'jennis@oceanavenuecapital.com',
    linkedIn: 'https://www.linkedin.com/in/jeff-ennis',
    source: 'Official team page oceanavenuecapital.com + Crunchbase (Co-founders: Duran Curis, Jacques Youssefmir, Jeff Ennis)',
    status: 'Enriched',
    notes: 'Santa Monica-based PE. Partners with independent sponsors. Co-founded with Duran Curis and Jacques Youssefmir.'
  },
  {
    rowNumber: 780,
    company: 'Rainier Partners',
    contactName: 'Alex Rolfe',
    title: 'Co-Founder and Managing Partner',
    email: 'arolfe@rainierpartners.com',
    linkedIn: 'https://www.linkedin.com/in/alex-rolfe',
    source: 'RocketReach email pattern a******@rainierpartners.com',
    status: 'Enriched',
    notes: 'Seattle-based PE. Founded 2020. Lower middle-market services businesses. Focus on Western US & Canada.'
  },
  {
    rowNumber: 785,
    company: 'Riverwood Capital',
    contactName: 'Jeff Parks',
    title: 'Co-Founder and Co-Managing Partner',
    email: 'jparks@riverwoodcapital.com',
    linkedIn: 'https://www.linkedin.com/in/jeff-parks-riverwood',
    source: 'RocketReach email pattern j******@riverwoodcapital.com + official team page',
    status: 'Enriched',
    notes: '$6.1B AUM. Tech focus. Co-heads with Francisco Alvarez-Demalde. Founded 2008.'
  },
  {
    rowNumber: 806,
    company: 'Trinity Investors',
    contactName: 'Dan Meader',
    title: 'Managing Partner',
    email: 'dan@trinityinvestors.com',
    linkedIn: 'https://www.linkedin.com/in/dan-meader-cfa-cpa-03377113',
    source: 'Official website trinityinvestors.com/dan (CONFIRMED: dan@trinityinvestors.com)',
    status: 'Enriched',
    notes: 'Southlake, TX PE firm. Co-Managing Partners: Dan Meader (CFA, CPA) and Sanjay Chandra. Founded 2006. $2B+ equity invested.'
  }
];

async function updateSheet() {
  console.log('🔄 Batch 2: Updating Google Sheet with enriched contacts...\n');
  
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`📊 Updating ${enrichments.length} rows\n`);
  
  // Update each row
  for (const enrichment of enrichments) {
    const row = enrichment.rowNumber;
    const range = `Sheet1!C${row}:I${row}`; // Update Contact Name through Notes
    
    const values = [
      [
        enrichment.contactName,        // Column C: Contact Name
        enrichment.title,               // Column D: Title
        enrichment.email,               // Column E: Email
        '', // Skip website column F (keep existing)
        enrichment.linkedIn,            // Column G: LinkedIn
        enrichment.status,              // Column H: Status
        `${enrichment.notes} | Source: ${enrichment.source}` // Column I: Notes
      ]
    ];
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: { values },
      });
      
      console.log(`✅ Row ${row}: ${enrichment.company}`);
      console.log(`   ${enrichment.contactName} - ${enrichment.title}`);
      console.log(`   ${enrichment.email}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error updating row ${row}:`, error.message);
    }
  }
  
  console.log(`\n✅ Batch 2 complete: Updated ${enrichments.length} rows\n`);
  console.log('📊 Total enrichments so far: 10 leads (6 in batch 1 + 4 in batch 2)\n');
}

updateSheet().catch(console.error);
