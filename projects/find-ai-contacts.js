const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'sheets-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A2:I'
  });
  const rows = res.data.values || [];
  console.log('Total contacts in CRM:', rows.length);

  const keywords = [
    'cto', 'chief technology', 'chief ai', 'head of ai', 'vp ai',
    'director of ai', 'chief data', 'chief digital', 'digital transform',
    'chief innovation', 'vp innovation', 'machine learning', 'data science',
    'artificial intelligence', 'head of data', 'head of digital',
    'vp technology', 'vp data', 'head of technology'
  ];

  const matches = [];
  rows.forEach(r => {
    const t = (r[3] || '').toLowerCase();
    if (keywords.some(k => t.includes(k))) {
      matches.push({
        company: r[0],
        score: r[1],
        name: r[2],
        title: r[3],
        email: r[4],
        emailStatus: r[5],
        linkedin: r[6]
      });
    }
  });

  console.log('\nAI/Tech titled contacts:', matches.length);
  console.log('---');
  matches.forEach(m => {
    console.log(`${m.company} | ${m.name} | ${m.title} | ${m.email} | ${m.emailStatus} | Score: ${m.score}`);
  });

  // Also find firms that DON'T have any AI/tech contacts
  const firmsWithAI = new Set(matches.map(m => m.company));
  const allFirms = new Set(rows.map(r => r[0]));
  const firmsWithoutAI = [...allFirms].filter(f => !firmsWithAI.has(f));
  console.log('\nFirms WITHOUT AI/tech contacts:', firmsWithoutAI.length);
})();
