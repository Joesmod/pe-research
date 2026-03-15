const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const enrichments = [
  {
    row: 588,
    company: 'D1 Capital Partners L.P.',
    contactName: 'Daniel Sundheim',
    title: 'Founder & Chief Investment Officer',
    email: 'dan@d1capital.com',
    linkedin: 'https://linkedin.com/in/daniel-sundheim-565935124',
    notes: 'Apollo verified email'
  },
  {
    row: 591,
    company: 'Dhanani Private Equity Group',
    contactName: 'Nadyrshah (Nick) Dhanani',
    title: 'CEO & Chairman',
    email: 'nick@dhananipeg.com',
    linkedin: 'https://linkedin.com/in/nick-dhanani-245506210',
    notes: 'Apollo verified email'
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const item of enrichments) {
    const range = `Sheet1!C${item.row}:K${item.row}`;
    
    const values = [[
      item.contactName,
      item.title,
      item.email,
      '',
      item.linkedin,
      '',
      '',
      'Enriched',
      item.notes
    ]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: range,
      valueInputOption: 'RAW',
      resource: { values }
    });
    
    console.log(`✓ Updated row ${item.row}: ${item.company} - ${item.contactName}`);
  }
  
  console.log(`\n✅ Batch 2: Successfully enriched ${enrichments.length} leads`);
})().catch(console.error);
