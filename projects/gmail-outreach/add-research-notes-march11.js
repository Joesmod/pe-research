const { google } = require('googleapis');

async function addResearchNotes() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Add notes for the 3 researched firms
  const updates = [
    {
      row: 176,
      company: 'Hg Capital',
      note: 'Manual research 2026-03-12: No public individual emails found. Official website (hgcapital.com) only provides generic addresses (info@hgcapital.com, press@hgcapital.com). Large PE firm with restricted contact policy.'
    },
    {
      row: 234,
      company: 'The Jordan Company (TJC)',
      note: 'Manual research 2026-03-12: ZoomInfo references Ian Arons (Partner, Co-Chair Investment Committee) with obfuscated email pattern i***@thejordancompany.com. Email pattern not verified on official website. Official site (tjclp.com) only lists phone: (212) 572-0800. Consider LinkedIn outreach or phone contact.'
    },
    {
      row: 493,
      company: '360 Equipment Finance',
      note: 'Manual research 2026-03-12: RocketReach shows Kip Amstutz (President/CEO) with obfuscated email k***@360equipmentfinance.com. Pattern inferred but not verified on company website. LinkedIn profile: https://www.linkedin.com/in/kip-amstutz-64603431/. Consider LinkedIn outreach.'
    }
  ];
  
  console.log('=== ADDING RESEARCH NOTES TO SHEET ===\n');
  
  for (const update of updates) {
    // Update Notes column (L)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!L${update.row}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[update.note]]
      }
    });
    
    console.log(`✓ Added note to Row ${update.row} (${update.company})`);
  }
  
  console.log('\n✅ All research notes added');
}

addResearchNotes().catch(console.error);
