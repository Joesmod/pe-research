const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
(async () => {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  const res = await sheets.spreadsheets.values.get({spreadsheetId: id, range: 'Sheet1!A1:Z1'});
  console.log('Headers:', JSON.stringify(res.data.values[0]));
  
  // Append Tixel row
  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: 'Sheet1!A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['Tixel', '', '', '', '', '', '', '', 'Waiting on email intro', '', 'AI engineering enablement engagement. Jeff doing work with them. Steve note: could be AI engineering enablement engagement.']]
    }
  });
  console.log('Tixel added to CRM');
})();
