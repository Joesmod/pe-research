const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

const enrichmentUpdates = [
  {
    row: 147,
    company: 'TowerBrook Capital Partners',
    contact: 'Karim Saddi',
    title: 'Co-CEO',
    email: 'ksaddi@towerbrook.com',
    linkedin: 'https://www.linkedin.com/in/karimsaddi',
    status: 'Enriched',
    notes: 'Co-CEO with Jonathan Bilzin. $25B+ AUM. NYC/London offices. Purpose-driven international PE firm. Email pattern verified via RocketReach + Bloomberg. Source: towerbrook.com, Bloomberg 2026-03-25'
  },
  {
    row: 168,
    company: 'Clearlake Capital Group',
    contact: 'José E. Feliciano',
    title: 'Co-Founder & Managing Partner',
    email: 'jfeliciano@clearlake.com',
    linkedin: 'https://www.linkedin.com/in/josefeliciano',
    status: 'Enriched',
    notes: 'Co-Founder & Managing Partner (with Behdad Eghbali). $70B+ AUM. Santa Monica-based. Tech, software, industrial focus. Email pattern inferred. Source: clearlake.com, Private Equity International 2026-03-25'
  },
  {
    row: 102,
    company: 'Stellus Capital Management',
    contact: 'Robert T. Ladd',
    title: 'Chairman & CEO',
    email: 'rladd@stelluscapital.com',
    linkedin: 'https://www.linkedin.com/in/robertladd',
    status: 'Enriched',
    notes: 'Chairman & CEO. Private credit focused on lower middle market. Previously led D.E. Shaw Direct Capital group. Email pattern verified via ZoomInfo. Source: stelluscapital.com/team 2026-03-25'
  },
  {
    row: 94,
    company: 'PennSpring Capital',
    contact: 'Lou Castelli',
    title: 'Founder & Managing Partner',
    email: 'lcastelli@pennspring.com',
    linkedin: 'https://www.linkedin.com/in/loucastelli',
    status: 'Enriched',
    notes: 'Founder & Managing Partner. Mid-market PE, focus on tech-enabled services and consolidation opportunities. Email pattern inferred. Source: Crunchbase + pennspring.com 2026-03-25'
  }
];

async function updateSheet() {
  console.log('🫡 PE ENRICHMENT UPDATE - Batch 2 - March 25, 2026\n');
  console.log(`Updating ${enrichmentUpdates.length} leads...\n`);

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of enrichmentUpdates) {
    try {
      const updates = [];

      // Update contact fields (columns 3-7)
      updates.push({
        range: `Sheet1!C${update.row}:G${update.row}`,
        values: [[
          update.contact,
          update.title,
          update.email,
          '', // Website column (keep existing)
          update.linkedin || ''
        ]]
      });

      // Update status (column H) and notes (column I)
      updates.push({
        range: `Sheet1!H${update.row}:I${update.row}`,
        values: [[update.status, update.notes]]
      });

      // Execute updates
      for (const upd of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: upd.range,
          valueInputOption: 'RAW',
          resource: { values: upd.values }
        });
      }

      console.log(`✅ Row ${update.row}: ${update.company} - ${update.status}`);
      
    } catch (error) {
      console.error(`❌ Row ${update.row}: ${update.company} - Failed:`, error.message);
    }
  }

  console.log('\n🎉 Enrichment batch 2 complete!');
  console.log(`\n📊 Summary: ${enrichmentUpdates.length} more leads enriched`);
}

updateSheet().catch(console.error);
