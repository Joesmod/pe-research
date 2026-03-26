const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'C:/Users/aljen/.openclaw/workspace-jim/projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  const rows = data.data.values || [];
  const targets = ['tixel', 'backstroke', 'satso', 'muse'];
  for (let i = 0; i < rows.length; i++) {
    if (targets.includes(rows[i][0]?.toLowerCase())) {
      console.log(`Row ${i+1}: ${JSON.stringify(rows[i])}`);
    }
  }

  // Also check Contacts for Tixel
  const contacts = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Contacts!A:I'
  });
  const crows = contacts.data.values || [];
  for (let i = 0; i < crows.length; i++) {
    if (crows[i][0]?.toLowerCase() === 'tixel') {
      console.log(`Contacts Row ${i+1}: ${JSON.stringify(crows[i])}`);
    }
  }
}
main().catch(console.error);
