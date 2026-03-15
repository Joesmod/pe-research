const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Enrichment data from Apollo + web research
const enrichments = [
  {
    row: 250,
    company: 'Atlantic Street Capital',
    contactName: 'Peter Shabecoff',
    title: 'Co-CEO / Managing Partner',
    email: 'peter@atlanticstreetcapital.com',
    linkedin: 'https://linkedin.com/in/shabecoff-peter-0617005',
    notes: 'Apollo verified email; phone (203) 428-3150'
  },
  {
    row: 586,
    company: 'Constitution Capital Partners',
    contactName: 'Vicente (Vil) Ramos',
    title: 'Managing Partner',
    email: 'vramos@concp.com',
    linkedin: 'https://linkedin.com/in/vilramos',
    notes: 'Apollo verified email'
  },
  {
    row: 594,
    company: 'Drive Capital',
    contactName: 'Chris Olsen',
    title: 'Co-Founder, Partner',
    email: 'chris@drivecap.com',
    linkedin: 'https://linkedin.com/in/cholsen',
    notes: 'ContactOut source (needs verification)'
  },
  {
    row: 724,
    company: 'Carmel Capital Partners',
    contactName: 'Russell Silberstein',
    title: 'Founder, CIO',
    email: '',
    linkedin: 'https://linkedin.com/in/russell-silberstein-8b5a667',
    notes: 'Phone: (858) 457-7544; Form ADV contact'
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const item of enrichments) {
    const range = `Sheet1!C${item.row}:K${item.row}`;
    
    // Column mapping: C=Contact Name, D=Title, E=Email, G=LinkedIn, K=Notes
    const values = [[
      item.contactName,
      item.title,
      item.email,
      '', // Website (F) - skip
      item.linkedin,
      '', // Sector Focus (H) - skip
      '', // Portfolio Companies (I) - skip
      'Enriched', // Status (J)
      item.notes // Last Contacted / Notes (K)
    ]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: range,
      valueInputOption: 'RAW',
      resource: { values }
    });
    
    console.log(`✓ Updated row ${item.row}: ${item.company} - ${item.contactName}`);
  }
  
  console.log(`\n✅ Successfully enriched ${enrichments.length} leads`);
})().catch(console.error);
