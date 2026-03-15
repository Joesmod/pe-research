const { google } = require('googleapis');

async function fixRow285() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Fix: Move data to correct columns
  // B (NotebookLM) should be empty
  // C (Contact Name) should be "Patrick Knise"
  // D (Title) should be "Managing Director"
  // E (Email) should be "knise@sentinelpartners.com"
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!B285:E285',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['', 'Patrick Knise', 'Managing Director', 'knise@sentinelpartners.com']]
    }
  });
  
  console.log('✓ Fixed row 285 (Sentinel Capital Partners)');
}

fixRow285().catch(console.error);
