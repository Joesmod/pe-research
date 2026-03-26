const { google } = require('googleapis');

async function readCRM() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read Sheet1 (companies)
  const sheet1 = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  // Read Contacts sheet
  const contacts = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Contacts!A:I',
  });
  
  console.log(JSON.stringify({
    sheet1: sheet1.data.values,
    contacts: contacts.data.values
  }, null, 2));
}

readCRM().catch(console.error);
