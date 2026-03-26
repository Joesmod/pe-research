const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Final batch enrichments
  const updates = [
    // Wicks Capital Partners / The Wicks Group - Row 221
    {
      range: 'Sheet1!A221:K221',
      values: [['The Wicks Group', 'https://www.linkedin.com/company/the-wicks-group', '', '', '',
                'https://www.linkedin.com/company/the-wicks-group', 'https://www.linkedin.com/company/the-wicks-group',
                'Information, Education, Media', 'Lower-middle-market portfolio companies', 'Researched - No Email',
                'NYC-based. Founded 1989. $1.2B+ equity invested. Note: Listed as "Wicks Capital Partners" but operates as "The Wicks Group". No public team/email info found.']]
    },
    // Clayton Dubilier & Rice (CD&R) - Row 231 (update with more info)
    {
      range: 'Sheet1!C231:K231',
      values: [['Vindi Banga', 'Operating Partner', '',
                'https://www.cdr.com', 'https://www.cdr.com/team/vindi-banga',
                'Healthcare, Industrials, Business Services, Financial Services', '', 'Researched - No Email',
                'Major PE firm (~$80B+ AUM). Also: Sid Jhaver, Jon Selib, Bill Berutti (Partners). NY/London offices. Tel: 212-407-5200. No direct emails published.']]
    }
  ];
  
  console.log('Updating sheet with final batch enrichments...');
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: {
          values: update.values
        }
      });
      console.log(`✓ Updated ${update.range}`);
    } catch (err) {
      console.error(`✗ Error updating ${update.range}:`, err.message);
    }
  }
  
  console.log('\n=== FINAL BATCH ENRICHMENT COMPLETE ===');
  console.log('Total enriched this batch: 2 leads');
  console.log('GRAND TOTAL: 15 leads enriched across all batches');
}

enrichSheet().catch(console.error);
