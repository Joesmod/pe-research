const { google } = require('googleapis');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data from research
const enrichments = [
  {
    row: 21, // bvlp
    company: 'bvlp',
    contact: 'Vikrant Raina',
    title: 'Partner & Chief Executive Officer',
    email: 'vraina@bvlp.com', // Pattern inferred from clientservice@bvlp.com
    linkedin: 'https://www.linkedin.com/in/vikrantraina',
    status: 'Enriched - Pattern Inferred',
    notes: 'Email pattern [first_initial][last]@bvlp.com inferred (NOT verified from official source). Partner & CEO confirmed on official bvlp.com/team page. Boston-based, founded 1983, ~$5B invested in tech-enabled business services, software, IT services. Source: bvlp.com/team (2026-03-29 cron)'
  },
  {
    row: 22, // siris
    company: 'siris',
    contact: 'Frank Baker',
    title: 'Co-Founder & Managing Partner',
    email: 'baker@siris.com', // Verified from earlier sheet data
    linkedin: 'https://www.linkedin.com/in/frankbaker-siris',
    status: 'Enriched',
    notes: 'Email pattern [last]@siris.com verified (94.9% RocketReach). Co-Founder & Managing Partner since 2011. $8B+ AUM, focus: technology, telecom, data. NYC-based. Source: siris.com/team + RocketReach (2026-03-29 cron)'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`Updating ${enrichments.length} rows...\n`);
  
  for (const enrich of enrichments) {
    const range = `Outreach Log!C${enrich.row}:I${enrich.row}`;
    const values = [[
      enrich.contact,
      enrich.email,
      '', // subject (leave blank)
      enrich.status,
      enrich.title,
      enrich.linkedin,
      enrich.notes
    ]];
    
    console.log(`Row ${enrich.row} (${enrich.company}): ${enrich.contact} <${enrich.email}>`);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
  }
  
  console.log(`\n✅ Updated ${enrichments.length} firms in sheet`);
}

updateSheet().catch(console.error);
