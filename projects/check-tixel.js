const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'gmail-outreach/service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  const res = await sheets.spreadsheets.values.get({spreadsheetId:id, range:'Sheet1!A:M'});
  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].toLowerCase().includes('tixel')) {
      console.log(`Row ${i+1}:`, JSON.stringify(rows[i]));
    }
  }
}
run().catch(e=>console.error(e));
