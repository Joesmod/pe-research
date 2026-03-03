const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  if (process.argv[2] === 'read') {
    const r = await sheets.spreadsheets.values.get({spreadsheetId: ID, range: "'Replied / Active'!A1:Z5"});
    console.log(JSON.stringify(r.data.values, null, 2));
  }
  
  if (process.argv[2] === 'append') {
    const now = new Date().toISOString().split('T')[0];
    await sheets.spreadsheets.values.append({
      spreadsheetId: ID,
      range: "'Replied / Active'!A1",
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [JSON.parse(process.argv[3])]
      }
    });
    console.log('Appended!');
  }
}
run().catch(e => console.error(e.message));
