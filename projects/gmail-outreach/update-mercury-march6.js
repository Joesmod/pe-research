const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Update row 763 (Mercury Fund)
  // Columns: C=Contact Name, D=Title, E=Email, G=LinkedIn
  const updates = [
    {
      range: 'Sheet1!C763',
      values: [['Blair Garrou']]
    },
    {
      range: 'Sheet1!D763',
      values: [['Managing Partner']]
    },
    {
      range: 'Sheet1!E763',
      values: [['contact@mercuryfund.com']]
    },
    {
      range: 'Sheet1!G763',
      values: [['https://www.linkedin.com/in/bgarrou/']]
    },
    {
      range: 'Sheet1!J763',
      values: [['Enriched']]
    },
    {
      range: 'Sheet1!L763',
      values: [['Houston-based early-stage VC. $180M+ AUM. Blair Garrou (Managing Partner). Also: Adrian Fortino (GP), Aziz Gilani (GP), Samantha Lewis (Partner). General contact: contact@mercuryfund.com (official website). Source: Web research 2026-03-06']]
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
  
  console.log('✓ Mercury Fund enriched successfully');
}

updateSheet().catch(console.error);
