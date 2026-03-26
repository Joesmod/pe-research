const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Enrichment data with verified contacts
const updates = [
  {
    row: 7,
    company: "resurgenstech",
    contact: "Fred Sturgis",
    title: "Managing Director",
    linkedin: "https://www.linkedin.com/in/fred-sturgis/",
    notes: "Enriched via official team page on 2026-03-25"
  },
  {
    row: 13,
    company: "mountaingate",
    contact: "Sue Cho",
    title: "Managing Director and Partner",
    linkedin: "https://www.linkedin.com/in/sue-cho-44733714/",
    notes: "Enriched via official announcement and LinkedIn on 2026-03-25"
  },
  {
    row: 16,
    company: "pinebrook",
    contact: "Joe Gantz",
    title: "Managing Director / Founding Partner",
    linkedin: "https://www.linkedin.com/in/joe-gantz-537a9517/",
    notes: "Enriched via official team page on 2026-03-25"
  },
  {
    row: 20,
    company: "marlin",
    contact: "Nathan Pingelton",
    title: "Managing Director",
    linkedin: "https://www.linkedin.com/in/nathan-pingelton-6a179011/",
    notes: "Enriched via official team page on 2026-03-25"
  },
  {
    row: 21,
    company: "bvlp",
    contact: "Justin Garrison",
    title: "Partner",
    linkedin: "https://www.linkedin.com/in/justin-garrison/",
    notes: "Enriched via official team page on 2026-03-25"
  },
  {
    row: 22,
    company: "siris",
    contact: "Dave Calamai",
    title: "Managing Director",
    linkedin: "https://www.linkedin.com/in/dave-calamai/",
    notes: "Enriched via official team page on 2026-03-25"
  },
  {
    row: 23,
    company: "unionassociates",
    contact: "Bill Ogden",
    title: "Managing Partner",
    linkedin: "https://www.linkedin.com/in/bill-ogden/",
    notes: "Enriched via official press release on 2026-03-25"
  },
  {
    row: 24,
    company: "littlejohnllc",
    contact: "Brian Michaud",
    title: "Managing Director",
    linkedin: "https://www.linkedin.com/in/brian-michaud-27111514/",
    notes: "Enriched via official team page on 2026-03-25"
  },
  {
    row: 25,
    company: "pfingsten",
    contact: "Denny Bolzan",
    title: "Managing Director",
    linkedin: "https://www.linkedin.com/in/denny-bolzan-57683419/",
    notes: "Enriched via official team page on 2026-03-25"
  },
  {
    row: 26,
    company: "onerock",
    contact: "Allison Spector",
    title: "Managing Director, Head of Sustainability",
    linkedin: "https://www.linkedin.com/in/allison-spector/",
    notes: "Enriched via official announcement on 2026-03-25"
  }
];

async function updateSheet() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Prepare batch update data
  const updateData = updates.map(u => ({
    range: `Outreach Log!C${u.row}:I${u.row}`,
    values: [[
      u.contact,           // Contact Name (C)
      '',                  // Email - keep existing (D)
      '',                  // Subject - keep existing (E)
      'Enriched',          // Status (F)
      u.title,             // Title (G)
      u.linkedin,          // LinkedIn (H)
      u.notes              // Notes (I)
    ]]
  }));
  
  console.log(`Updating ${updates.length} rows...`);
  
  const batchUpdateRequest = {
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'RAW',
      data: updateData
    }
  };
  
  const result = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
  console.log(`✅ Updated ${result.data.totalUpdatedRows} rows`);
  console.log(`Updated cells: ${result.data.totalUpdatedCells}`);
}

updateSheet().catch(console.error);
