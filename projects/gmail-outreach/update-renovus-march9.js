const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateRenovus() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Row 988 = Renovus Capital Partners
  // Update: Contact Name, Title, Email, LinkedIn, Notes, Status
  
  const updates = [
    {
      range: 'Sheet1!C988', // Contact Name
      values: [['Jason Tanker']]
    },
    {
      range: 'Sheet1!D988', // Title
      values: [['Managing Director']]
    },
    {
      range: 'Sheet1!E988', // Email
      values: [['jason.tanker@renovuscapital.com']]
    },
    {
      range: 'Sheet1!F988', // LinkedIn
      values: [['https://www.linkedin.com/in/jtanker']]
    },
    {
      range: 'Sheet1!H988', // Notes
      values: [['Wayne PA. Knowledge & Talent industry PE. $2B+ AUM. Ex-Norwest/Comcast/Microsoft. Wharton. Source: Official team page + ZoomInfo pattern (2026-03-09)']]
    },
    {
      range: 'Sheet1!I988', // Status
      values: [['Enriched']]
    }
  ];

  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      requestBody: {
        values: update.values
      }
    });
    console.log(`✓ Updated ${update.range}`);
  }

  console.log('\n✅ Successfully enriched Renovus Capital Partners (Row 988)');
}

updateRenovus().catch(console.error);
