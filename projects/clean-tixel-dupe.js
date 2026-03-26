const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'gmail-outreach/service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get sheet ID for Sheet1
  const meta = await sheets.spreadsheets.get({spreadsheetId: id});
  const sheet1 = meta.data.sheets.find(s => s.properties.title === 'Sheet1');
  const sheetId = sheet1.properties.sheetId;
  
  // Delete row 908 (0-indexed = 907)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: 907, endIndex: 908 }
        }
      }]
    }
  });
  console.log('Deleted duplicate Tixel row 908');
}
run().catch(e=>console.error(e));
