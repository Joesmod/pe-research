const { google } = require('googleapis');
const key = require('./service-account.json');

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet() {
  console.log('=== PE ENRICHMENT UPDATE - March 8, 2026 11:36 PM ===\n');
  
  const today = new Date().toISOString().split('T')[0];
  
  const updates = [];
  
  // Row 459: Centerview Partners - Blair Effron
  // VERIFIED email found
  updates.push({
    range: 'Sheet1!E459',
    values: [['beffron@centerviewpartners.com']]
  });
  updates.push({
    range: 'Sheet1!J459',
    values: [['Enriched']]
  });
  updates.push({
    range: 'Sheet1!L459',
    values: [[`Email verified via ContactOut - ${today}`]]
  });
  
  // Row 974: Bow River Capital - Greg J. Hiatrides
  // Email NOT publicly available - only partial patterns on RocketReach/ZoomInfo
  updates.push({
    range: 'Sheet1!L974',
    values: [[`Email not publicly available. Partial pattern found on RocketReach (h******@bowrivercapital.com) - ${today}`]]
  });
  
  // Row 975: Amulet Capital Partners - Avi Uttamchandani
  // Email NOT publicly available - only partial patterns on RocketReach/ZoomInfo
  updates.push({
    range: 'Sheet1!L975',
    values: [[`Email not publicly available. Partial pattern found on RocketReach (a******@amuletcapital.com) - ${today}`]]
  });
  
  // Row 976: Trivest Partners - Reid Callaway
  // Email NOT publicly available - only partial patterns on Wiza
  updates.push({
    range: 'Sheet1!L976',
    values: [[`Email not publicly available. Partial pattern found on Wiza (r*****@trivest.com) - ${today}`]]
  });
  
  console.log('Updating Google Sheet...');
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });
  
  console.log('✓ Sheet updated successfully\n');
  console.log('=== SUMMARY ===');
  console.log('Enriched with verified email: 1');
  console.log('  • Row 459: Blair Effron - beffron@centerviewpartners.com');
  console.log('\nCould not find publicly available emails: 3');
  console.log('  • Row 974: Greg J. Hiatrides (Bow River Capital)');
  console.log('  • Row 975: Avi Uttamchandani (Amulet Capital Partners)');
  console.log('  • Row 976: Reid Callaway (Trivest Partners)');
  console.log('\nNotes added to all rows documenting research sources.');
}

updateSheet().catch(console.error);
