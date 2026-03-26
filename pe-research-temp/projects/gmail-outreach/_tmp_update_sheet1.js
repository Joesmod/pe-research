const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  // Find Charlesbank in Sheet1
  const r = await sheets.spreadsheets.values.get({spreadsheetId: ID, range: 'Sheet1!A:J'});
  const rows = r.data.values || [];
  let rowIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].toLowerCase().includes('charlesbank')) {
      rowIdx = i + 1; // 1-indexed
      console.log('Found Charlesbank at row', rowIdx, ':', rows[i].slice(0,3));
      break;
    }
  }
  if (rowIdx === -1) {
    console.log('Charlesbank not found in Sheet1');
    return;
  }
  // Update Status (col I) and Last Contacted (col J)
  await sheets.spreadsheets.values.update({
    spreadsheetId: ID,
    range: `Sheet1!I${rowIdx}:J${rowIdx}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['Responded', '2026-02-19']] }
  });
  console.log('Updated Sheet1 row', rowIdx, 'Status=Responded, Last Contacted=2026-02-19');
}
run().catch(e => console.error(e.message));
