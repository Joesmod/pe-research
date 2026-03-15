const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data from research 2026-03-10
const enrichments = [
  {
    row: 7,
    company: 'SDC Capital Partners',
    contact: 'Todd Aaron',
    title: 'Founder & Managing Partner',
    email: 'taaron@sdccapitalpartners.com',
    linkedin: 'https://www.linkedin.com/in/todd-aaron',
    notes: 'RocketReach verified. Also: Doug Kaden (MP, dkaden@sdccapitalpartners.com). Email format: firstinitiallastname@sdccapitalpartners.com. Source: RocketReach + official team page. Enriched 2026-03-10.'
  },
  {
    row: 8,
    company: 'Rockbridge Growth Equity, LLC',
    contact: 'Kevin Prokop',
    title: 'Managing Partner',
    email: 'kprokop@rbequity.com',
    linkedin: 'https://www.linkedin.com/in/kevinprokoprb/',
    notes: 'Co-founded with Dan Gilbert. Also: Brian Hermelin (MP, bhermelin@rbequity.com likely). Detroit-based. Source: RocketReach. Enriched 2026-03-10.'
  },
  {
    row: 17,
    company: 'Knox Capital',
    contact: 'Peter Pacelli',
    title: 'Principal',
    email: 'ppacelli@knox-cap.com',
    linkedin: 'https://www.linkedin.com/in/peter-pacelli',
    notes: 'Ex-Wind Point Partners. Also: Alex Gregor (Partner/Founder), Mike Bryant (Partner). Phone: (312) 402-1425. Source: Apollo.io + Tracxn. Enriched 2026-03-10.'
  },
  {
    row: 26,
    company: 'Incline Equity Partners',
    contact: 'Jack Glover',
    title: 'Founder & Managing Partner',
    email: 'jglover@inclineequity.com',
    linkedin: 'https://www.linkedin.com/in/jack-glover-87495a10/',
    notes: '$1.9B+ AUM. Pittsburgh. 30+ yr PE career. deals@inclineequity.com for add-ons. Source: RocketReach + LinkedIn. Enriched 2026-03-10.'
  },
  {
    row: 59,
    company: 'Kohlberg & Company',
    contact: 'Daniel Slutsky',
    title: 'Managing Director',
    email: 'slutsky@kohlberg.com',
    linkedin: 'https://www.linkedin.com/in/daniel-slutsky',
    notes: 'Email format: last@kohlberg.com (92.9% verified). Also: Jordan Hill (MD Credit, hill@kohlberg.com). Mount Kisco, NY. Source: RocketReach email format database. Enriched 2026-03-10.'
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`Updating ${enrichments.length} rows...\n`);
  
  for (const enrich of enrichments) {
    const row = enrich.row;
    
    // Update columns C (Contact Name), D (Title), E (Email), G (LinkedIn), L (Notes), J (Status)
    const updates = [
      {
        range: `Sheet1!C${row}`,
        values: [[enrich.contact]]
      },
      {
        range: `Sheet1!D${row}`,
        values: [[enrich.title]]
      },
      {
        range: `Sheet1!E${row}`,
        values: [[enrich.email]]
      },
      {
        range: `Sheet1!G${row}`,
        values: [[enrich.linkedin]]
      },
      {
        range: `Sheet1!L${row}`,
        values: [[enrich.notes]]
      },
      {
        range: `Sheet1!J${row}`,
        values: [['Enriched']]
      }
    ];
    
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: {
          values: update.values
        }
      });
    }
    
    console.log(`✅ Row ${row}: ${enrich.company} - ${enrich.contact} (${enrich.email})`);
  }
  
  console.log('\n✅ All enrichments completed!');
})();
