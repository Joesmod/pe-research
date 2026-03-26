const { google } = require('googleapis');
const path = require('path');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join('C:', 'Users', 'aljen', '.openclaw', 'workspace-jim', 'projects', 'gmail-outreach', 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Outreach Log!A:L'
  });
  console.log(JSON.stringify(res.data.values, null, 2));
}

readSheet().catch(console.error);
