const {google} = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const enrichments = [
  {
    row: 1235,
    firm: 'The Riverside Company',
    contact: 'Stewart Kohl',
    title: 'Co-CEO & Managing Partner',
    email: 'skohl@riversidecompany.com',
    linkedin: 'https://www.linkedin.com/in/stewart-kohl/',
    notes: 'Email pattern from ZoomInfo (s***@riversidecompany.com). Co-CEO & Managing Partner since 1993 (joined). Founded 1988. Cleveland & NY headquarters. Global firm, smaller end of middle market. Source: riversidecompany.com/team + ZoomInfo (2026-03-15 cron)',
    status: 'Enriched'
  },
  {
    row: 1236,
    firm: 'Abry Partners',
    contact: 'C.J. Brucato',
    title: 'Chief Executive Officer',
    email: 'cbrucato@abry.com',
    linkedin: 'https://www.linkedin.com/in/c-j-brucato-iii-b33830/',
    notes: 'Email pattern from ZoomInfo (c***@abry.com). CEO since 2023 (Co-CEO 2018-2023). $17B AUM, founded 1989. Boston-based sector-focused investors with flexible capital. Source: abry.com/team-member/c-j-brucato + ZoomInfo (2026-03-15 cron)',
    status: 'Enriched'
  },
  {
    row: 1237,
    firm: 'Caltius Equity Partners',
    contact: 'Garrick Ahn',
    title: 'Co-Founder & Managing Director',
    email: 'gahn@caltius.com',
    linkedin: 'https://www.linkedin.com/in/garrick-ahn-b5871638/',
    notes: 'Email VERIFIED from BusinessWire press release (gahn@caltius.com, 310-996-9578). Co-founder & Managing Director. LA-based middle market PE focused exclusively on business services sector. Part of Caltius Capital Management. Source: caltius.com/equity-partners/team + BusinessWire (2026-03-15 cron)',
    status: 'Enriched'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({version: 'v4', auth});
  
  const updates = enrichments.map(e => ({
    range: `Sheet1!C${e.row}:L${e.row}`,
    values: [[
      e.contact,              // C: Contact Name
      e.title,                // D: Title
      e.email,                // E: Email
      '',                     // F: (skip or empty)
      e.linkedin,             // G: LinkedIn Contact URL
      '',                     // H: (skip)
      '',                     // I: (skip)
      e.status,               // J: Status
      new Date().toISOString().split('T')[0], // K: Date
      e.notes                 // L: Notes
    ]]
  }));
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
    console.log(`✓ Updated ${update.range}`);
  }
  
  console.log(`\n✅ Updated ${enrichments.length} leads in Google Sheet (batch 3)`);
}

updateSheet().catch(console.error);
