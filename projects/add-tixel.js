const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'gmail-outreach/service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get headers
  const res = await sheets.spreadsheets.values.get({spreadsheetId:id, range:'Sheet1!A1:Z1'});
  console.log('Headers:', JSON.stringify(res.data.values[0]));
  
  // Check if Tixel already exists
  const allData = await sheets.spreadsheets.values.get({spreadsheetId:id, range:'Sheet1!A:A'});
  const names = (allData.data.values || []).map(r => r[0]?.toLowerCase());
  if (names.includes('tixel')) {
    console.log('Tixel already exists in Sheet1');
    return;
  }
  
  // Add Tixel row - need to know column layout first
  console.log('Tixel not found, will add after seeing headers');
}
run().catch(e=>console.error(e));
