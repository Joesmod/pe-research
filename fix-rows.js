const { google } = require('googleapis');
const key = require('../gmail-outreach/service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function fixRows() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  // Fix Row 18: Gryphon Investors (email in wrong column)
  console.log('Fixing Row 18: Gryphon Investors (email in Title column)...');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!D18:E18',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Founder & Co-CEO', 'andrews@gryphoninvestors.com']]
    }
  });
  console.log('✓ Fixed Gryphon Investors');

  // Fix Row 115: Alpine Investors (email in wrong column)
  console.log('Fixing Row 115: Alpine Investors (email in Title column)...');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!D115:E115',
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Founding Partner & President', 'mstrauch@alpineinvestors.com']]
    }
  });
  console.log('✓ Fixed Alpine Investors');

  console.log('\n✅ Fixed 2 rows with misplaced email addresses!');
}

fixRows().catch(console.error);
