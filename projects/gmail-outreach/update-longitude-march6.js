const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Update row 760 (Longitude Capital)
  // Columns: C=Contact Name, D=Title, E=Email, G=LinkedIn
  const updates = [
    {
      range: 'Sheet1!C760',
      values: [['Marc-Henri Galletti']]
    },
    {
      range: 'Sheet1!D760',
      values: [['Co-Founder & Managing Director']]
    },
    {
      range: 'Sheet1!E760',
      values: [['mgalletti@longitudecapital.com']]
    },
    {
      range: 'Sheet1!G760',
      values: [['https://www.linkedin.com/in/marc-galletti-1315b45/']]
    },
    {
      range: 'Sheet1!J760',
      values: [['Enriched']]
    },
    {
      range: 'Sheet1!L760',
      values: [['Verified from Fierce Biotech press release. Healthcare VC, $2B+ AUM. Also: Patrick Enright (Co-Managing Director). Source: Web research 2026-03-06']]
    }
  ];
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: update.range,
      valueInputOption: 'RAW',
      requestBody: { values: update.values }
    });
    console.log(`Updated ${update.range}`);
  }
  
  console.log('✓ Longitude Capital enriched successfully');
}

updateSheet().catch(console.error);
