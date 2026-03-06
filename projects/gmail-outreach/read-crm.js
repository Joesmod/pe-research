const { google } = require('googleapis');
const fs = require('fs');

async function readCRM() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read both sheets
  const [sheet1Res, contactsRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:K',
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Contacts!A:J',
    })
  ]);
  
  console.log('=== SHEET1 DATA ===');
  console.log(JSON.stringify(sheet1Res.data.values, null, 2));
  console.log('\n=== CONTACTS DATA ===');
  console.log(JSON.stringify(contactsRes.data.values, null, 2));
}

readCRM().catch(console.error);
