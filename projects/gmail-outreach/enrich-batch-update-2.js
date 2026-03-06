const { google } = require('googleapis');

async function batchUpdate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [
    {
      range: 'Sheet1!C742:J742', // Excelsior Equity Partners
      values: [['Zak Rutz', 'Managing Director', 'zrutz@excelsiordynamic.com', 'https://excelsiordynamic.com/', 'https://www.linkedin.com/in/zak-rutz-a19b3015/', 'Legal Finance', 'Legal finance specialist. Email pattern inferred from LinkedIn.', 'Enriched']]
    },
    {
      range: 'Sheet1!C745:J745', // GF Capital Management
      values: [['Erik Baker', 'Co-Founder & Managing Director', 'ebaker@gfcap.com', 'http://gfcap.com/private-equity-team/', 'https://www.linkedin.com/in/erik-baker', 'Consumer/Media', 'Middle-market consumer & media PE. Email from Apollo.io.', 'Enriched']]
    },
    {
      range: 'Sheet1!C751:J751', // HUMAN CAPITAL
      values: [['Armaan Ali', 'Co-Founder, CEO & Managing Partner', 'armaan@human.capital', 'https://human.capital/about', 'https://www.linkedin.com/in/armaan-ali-37813b76', 'Technology/Multi-stage VC', 'Multi-stage VC, not traditional PE. Email from ContactOut.', 'Enriched']]
    },
    {
      range: 'Sheet1!C752:J752', // Hypatia Capital
      values: [['Patricia Lizarraga', 'Managing Partner', 'patricia.lizarraga@hypatiacapital.com', 'https://hypatiacapital.com/about/', 'https://www.linkedin.com/in/patricia-lizarraga', 'Women-led/ESG', 'Asset manager focused on women-led companies. Email from success.ai.', 'Enriched']]
    }
  ];
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: update.range,
      valueInputOption: 'RAW',
      resource: {
        values: update.values
      }
    });
    console.log(`Updated ${update.range}`);
  }
  
  console.log('Batch update 2 complete.');
}

batchUpdate().catch(console.error);
