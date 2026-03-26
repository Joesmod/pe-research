const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: './service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
(async () => {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  // Update row 501: Status (col I) and Notes (col K)
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: 'Sheet1!I501',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Waiting on email intro']] }
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: 'Sheet1!K501',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Warm lead via Jeff Caldwell. Awaiting email intro. Opportunity: AI engineering enablement engagement. Jeff doing work with them. Updated 2026-02-27.']] }
  });
  console.log('Tixel updated!');
})().catch(e => console.error(e.message));
