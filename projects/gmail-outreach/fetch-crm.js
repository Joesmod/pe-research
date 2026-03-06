const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    
    const sheet1 = await sheets.spreadsheets.values.get({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: 'Sheet1!A:J'
    });
    
    const contacts = await sheets.spreadsheets.values.get({
      spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
      range: 'Contacts!A:I'
    });
    
    console.log(JSON.stringify({
      sheet1: sheet1.data.values,
      contacts: contacts.data.values
    }));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
