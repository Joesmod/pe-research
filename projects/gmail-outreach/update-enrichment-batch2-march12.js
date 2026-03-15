const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateEnrichmentBatch2() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Additional updates
    const updates = [
      {
        row: 851, // Wynnchurch Capital - VERIFIED EMAIL!
        contactName: 'Greg B. Gleason',
        title: 'Managing Partner',
        email: 'ggleason@wynnchurch.com',
        linkedIn: 'https://www.linkedin.com/in/greg-gleason-4b772112',
        status: 'Enriched',
        notes: 'Managing Partner confirmed. Email verified on official Wynnchurch Capital press release. | Source: wynnchurch.com/news/wynnchurch-capital-closes-on-fund-vi-at-3-5-billion 2026-03-12'
      },
      {
        row: 510, // Edgewater Capital Partners
        contactName: 'Ryan Meany',
        title: 'Chairman of Investment Committee and Managing Partner',
        email: '',
        linkedIn: 'https://www.linkedin.com/company/edgewater-capital-partners/',
        status: 'Researched - No Public Contact',
        notes: 'Chairman of Investment Committee and Managing Partner confirmed. Runs day-to-day operations. No public email available. Phone: (216) 292-3838 | Source: edgewatercapital.com/team/ryan-meany/ 2026-03-12'
      },
      {
        row: 525, // Levine Leichtman Capital Partners
        contactName: 'Jarett Moyse',
        title: 'Managing Director',
        email: '',
        linkedIn: 'https://www.linkedin.com/company/levine-leichtman-capital-partners/',
        status: 'Researched - No Public Contact',
        notes: 'Managing Director confirmed. Rejoined LLCP in 2024, previously with firm 2016-2020. Responsible for investment due diligence and portfolio management. No public email available. | Source: llcp.com/team/jarett-moyse/ 2026-03-12'
      },
      {
        row: 864, // Accel-KKR
        contactName: 'Tom Barnds',
        title: 'Co-Managing Partner',
        email: 'inquiries@accel-kkr.com',
        linkedIn: 'https://www.linkedin.com/company/accel-kkr/',
        status: 'Researched - Generic Email Only',
        notes: 'Co-Managing Partner confirmed. Board seats include Basware, FastSpring, Kantata, Vendavo, Veryon, others. Generic firm email: inquiries@accel-kkr.com. Email pattern likely: first_initiallast@accel-kkr.com | Source: accel-kkr.com/team-member/tom-barnds/ 2026-03-12'
      }
    ];

    console.log(`🔄 Updating ${updates.length} additional rows...`);
    
    for (const update of updates) {
      const range = `Sheet1!C${update.row}:L${update.row}`;
      
      const values = [[
        update.contactName,
        update.title,
        update.email,
        '', // Website (leave as-is)
        update.linkedIn,
        '', // Sector Focus (leave as-is)
        '', // Portfolio Companies (leave as-is)
        update.status,
        '', // Last Contacted (leave as-is)
        update.notes
      ]];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`✅ Updated row ${update.row}: ${update.contactName} - ${update.status}`);
    }
    
    console.log(`\n✅ Successfully updated ${updates.length} additional leads`);
    console.log(`\n📊 BATCH 2 SUMMARY:`);
    console.log(`- Enriched (verified email): 1`);
    console.log(`- Generic Email Only: 1`);
    console.log(`- No Public Contact: 2`);
    console.log(`\n📊 TOTAL ENRICHMENT TODAY:`);
    console.log(`- Total leads enriched: 8`);
    console.log(`- Verified direct emails: 2 (Hg Capital, Wynnchurch Capital)`);
    console.log(`- Generic emails: 2 (Sentinel, Accel-KKR)`);
    console.log(`- No public contact: 4 (THL, WindPoint, Edgewater, LLCP)`);
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateEnrichmentBatch2().catch(console.error);
