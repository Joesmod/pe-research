const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  try {
    const key = JSON.parse(fs.readFileSync('service-account.json'));
    const auth = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('📝 Updating Google Sheet with enriched contacts (March 11, 7PM)...\n');

    const updates = [
      // Row 306 - Mountaingate Capital - Bennett Thompson (FULL EMAIL FOUND!)
      {
        range: 'Sheet1!C306',
        values: [['Bennett Thompson']]
      },
      {
        range: 'Sheet1!D306',
        values: [['Managing Director, Co-Founder']]
      },
      {
        range: 'Sheet1!E306',
        values: [['bthompson@mountaingate.com']]
      },
      {
        range: 'Sheet1!G306',
        values: [['https://www.linkedin.com/in/bennett-thompson-b780358/']]
      },
      {
        range: 'Sheet1!J306',
        values: [['Enriched']]
      },
      {
        range: 'Sheet1!L306',
        values: [['Web research (success.ai, mountaingate.com press releases): Bennett Thompson, Co-Founder & Managing Director. Email verified from multiple published sources. Phone: 303-390-5001. Mountaingate Capital: Denver-based growth PE, ~$2B AUM. 2026-03-11 enrichment.']]
      }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });

    console.log('✅ Updated 1 row (Mountaingate Capital - Bennett Thompson)\n');
    console.log('📊 Summary:');
    console.log('- Mountaingate Capital: Bennett Thompson (bthompson@mountaingate.com) - VERIFIED ✓');
    console.log('\n🔍 Additional findings (emails masked, needs verification):');
    console.log('- Mountaingate Capital: Sue Cho (Managing Director) - pattern masked');
    console.log('- Essex Investment: Nancy Prial (Co-CEO) - pattern masked');
    console.log('- 360 Equipment Finance: Kip Amstutz (CEO) - pattern masked');
    console.log('- Bertram Capital: Jeff Drazan (Managing Partner) - email pattern: [first_initial][last]@bcap.com');
    console.log('\n❌ Non-PE firms identified (should be removed):');
    console.log('- Apercen Partners LLC - Tax consulting firm for PE/VC clients');
    console.log('- Girls Who Invest - Nonprofit organization');
    console.log('\n⚠️ Large firms needing specific UK/international contacts:');
    console.log('- Hg Capital: $110B+ AUM, 400+ employees, needs specific contact person');
    console.log('- Sentinel Capital Partners: Only generic info@ found, needs specific contact');
    console.log('\n✅ Hourly enrichment run complete!');
  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateSheet().catch(console.error);
