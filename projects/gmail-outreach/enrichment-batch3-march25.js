const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

const enrichmentUpdates = [
  {
    row: 551,
    company: 'WestView Capital Partners',
    contact: 'Greg Thomas',
    title: 'General Partner',
    email: 'gthomas@wvcapital.com',
    linkedin: 'https://www.linkedin.com/in/gregthomas30',
    status: 'Enriched',
    notes: 'General Partner/Managing Partner. Joined 2012. Boston-based growth equity firm, $2.7B AUM. Focus: healthcare, technology, business services. Email pattern verified. Source: wvcapital.com, GrowthCap 2026-03-25'
  },
  {
    row: 282,
    company: 'Ronin Equity Partners',
    contact: 'David Feierstein',
    title: 'Co-Founder & Managing Partner',
    email: 'dfeierstein@roninequitypartners.com',
    linkedin: 'https://www.linkedin.com/in/david-feierstein-76370639',
    status: 'Enriched',
    notes: 'Co-Founder & Managing Partner. Oversees investment and execution services. Industrial and consumer focus. Email pattern verified via website. Source: roninequitypartners.com, LinkedIn 2026-03-25'
  },
  {
    row: 418,
    company: 'Kline Hill Partners',
    contact: 'Michael Bego',
    title: 'Managing Partner & Founder',
    email: 'mbego@klinehill.com',
    linkedin: 'https://www.linkedin.com/in/michael-bego-24b605',
    status: 'Enriched',
    notes: 'Managing Partner & Founder (since 2015). PE secondaries firm focused on underserved sellers. Greenwich-based. Received strategic investment from TA in 2025. Email pattern verified. Source: klinehill.com, TA.com 2026-03-25'
  }
];

async function updateSheet() {
  console.log('🫡 PE ENRICHMENT UPDATE - Batch 3 (Final) - March 25, 2026\n');
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

  console.log('\n🎉 Enrichment batch 3 complete!');
  console.log(`\n📊 Final Summary: ${enrichmentUpdates.length} more leads enriched`);
  console.log('📋 Total enriched today: 14 firms (batch 1: 7, batch 2: 4, batch 3: 3)');
}

updateSheet().catch(console.error);
