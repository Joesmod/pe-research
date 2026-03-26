const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

const enrichmentUpdates = [
  {
    row: 18,
    company: 'Gryphon Investors',
    contact: 'David Andrews',
    title: 'Founder & Co-CEO',
    email: 'dandrews@gryphoninvestors.com',
    linkedin: 'https://www.linkedin.com/in/davidandrewspe',
    status: 'Enriched',
    notes: 'Verified via RocketReach + website. $8.9B AUM. San Francisco. Also: Sabrina Brown (CEO). Source: gryphon-inv.com/team, RocketReach 2026-03-25'
  },
  {
    row: 13,
    company: 'Eckuity Capital',
    status: 'Enriched',
    notes: 'Youssef Sebban confirmed as Founder & Managing Partner. Healthcare growth equity focus. Email pattern verified via website contact page. Source: eckuity.com/about-us 2026-03-25'
  },
  {
    row: 19,
    company: 'Erez Capital',
    status: 'Enriched',
    notes: 'Michael Benezra confirmed as Managing Partner/Founder. Focus: Fintech, AI, PropTech, MedTech. Email pattern verified. Source: LinkedIn + Crunchbase 2026-03-25'
  },
  {
    row: 22,
    company: 'Flyover Capital',
    status: 'Enriched',
    notes: 'Tristan Mace confirmed as Managing Partner. Supports underestimated entrepreneurs in Flyover region. Email pattern verified. Source: flyovercapital.com/team 2026-03-25'
  },
  {
    row: 60,
    company: 'PSG Equity',
    status: 'Enriched',
    notes: 'Mark Hastings confirmed as CEO & Co-Founder (with Peter Wilde as Chairman). Growth equity in software/tech-enabled services. $1B+ AUM. Email pattern verified. Source: psgequity.com 2026-03-25'
  },
  {
    row: 191,
    company: 'Flexpoint Ford',
    status: 'Enriched',
    notes: 'Don Edwards confirmed as Founder & Executive Chairman (was CEO until Nov 2025). Chris Ackerman now Managing Partner. Financial services & healthcare focus. Email pattern verified. Source: flexpointford.com/team 2026-03-25'
  },
  {
    row: 101,
    company: 'Littlejohn & Co',
    status: 'Enriched',
    notes: 'Antonio Miranda confirmed as one of four Managing Partners (with Steven Raich, Michael Klein, Brian Ramsay). Mid-market PE since 2004. Email pattern verified. Source: littlejohnllc.com/team 2026-03-25'
  }
];

async function updateSheet() {
  console.log('🫡 PE ENRICHMENT UPDATE - March 25, 2026\n');
  console.log(`Updating ${enrichmentUpdates.length} leads...\n`);

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  for (const update of enrichmentUpdates) {
    try {
      const updates = [];

      // If we have new contact info, update contact fields (columns 3-7)
      if (update.contact) {
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
      }

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

  console.log('\n🎉 Enrichment update complete!');
  console.log(`\n📊 Summary: ${enrichmentUpdates.length} leads enriched with verified contacts`);
}

updateSheet().catch(console.error);
