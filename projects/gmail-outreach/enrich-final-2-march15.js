const { google } = require('googleapis');

async function enrichFinal2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Row 604: Evolution Credit Partners
  // Row 608: FTV Capital
  
  const updates = [
    {
      range: 'Sheet1!C604:I604',
      values: [[
        'Lisa Schwarzberg',
        'Founding Partner, MD & COO',
        'lschwarzberg@evolutioncreditpartners.com',
        '',
        'https://www.linkedin.com/in/lisa-schwarzberg/',
        'Enriched',
        'Email pattern first_initial+last@ verified via RocketReach/ZoomInfo 2026-03-15'
      ]]
    },
    {
      range: 'Sheet1!C608:I608',
      values: [[
        'Brad Bernstein',
        'Managing Partner',
        'bbernstein@ftvcapital.com',
        '',
        'https://www.linkedin.com/in/brad-bernstein-ftv/',
        'Enriched',
        'Email verified via ContactOut 2026-03-15'
      ]]
    }
  ];

  const batchUpdate = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: updates
    }
  });

  console.log('✅ Updated final 2 rows');
  console.log(`   Row 604: Evolution Credit Partners → Lisa Schwarzberg (lschwarzberg@evolutioncreditpartners.com)`);
  console.log(`   Row 608: FTV Capital → Brad Bernstein (bbernstein@ftvcapital.com)`);
  console.log(`\nTotal updated: ${batchUpdate.data.totalUpdatedRows} rows`);
}

enrichFinal2().catch(console.error);
