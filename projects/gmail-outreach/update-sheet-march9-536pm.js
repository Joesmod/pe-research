const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Update Alta Park Capital (Row 699)
    const updates = [
      {
        range: 'Sheet1!C699', // Contact Name
        values: [['Joe Bou-Saba']]
      },
      {
        range: 'Sheet1!D699', // Title
        values: [['Founder & Partner/Portfolio Manager']]
      },
      {
        range: 'Sheet1!E699', // Email
        values: [['joe@altaparkcapital.com']]
      },
      {
        range: 'Sheet1!G699', // LinkedIn
        values: [['https://www.linkedin.com/in/joe-bou-saba-8404622a/']]
      },
      {
        range: 'Sheet1!J699', // Status
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
      console.log(`Updated ${update.range}`);
    }

    console.log('\n✅ Successfully updated Alta Park Capital (Row 699)');
    console.log('   Contact: Joe Bou-Saba');
    console.log('   Title: Founder & Partner/Portfolio Manager');
    console.log('   Email: joe@altaparkcapital.com');
    console.log('   Status: Enriched');

    // Mark non-PE firms as Dead
    console.log('\n📋 Marking non-PE firms as "Dead":');
    
    const deadFirms = [
      { row: 409, name: 'Girls Who Invest' },
      { row: 621, name: 'HSP - Henkel Search Partners' },
      { row: 704, name: 'Apercen Partners LLC' },
      { row: 816, name: '414 Capital' }
    ];

    for (const firm of deadFirms) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${firm.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Dead']]
        }
      });
      console.log(`   Row ${firm.row}: ${firm.name} → Dead`);
    }

    console.log('\n✅ Sheet updated successfully!');
    console.log('\nSummary:');
    console.log('- 1 firm enriched (Alta Park Capital)');
    console.log('- 4 non-PE firms marked as Dead');
    console.log('- 27+ firms still need enrichment (recommend Apollo API)');

  } catch (error) {
    console.error('Error updating sheet:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

updateSheet();
