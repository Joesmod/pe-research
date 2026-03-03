const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  await sheets.spreadsheets.values.append({
    spreadsheetId: ID,
    range: "'Replied / Active'!A1",
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        "Sherif Barrad",
        "Charlesbank",
        "",
        "",
        "Email (cold outreach)",
        "2026-02-19",
        "Responded",
        "Advisory Director of AI. Requested capabilities deck. Assistant Sarah scheduling.",
        "Meeting mid-March",
        "Steve"
      ]]
    }
  });
  console.log('Done - Sherif added to Replied / Active');
}
run().catch(e => console.error(e.message));
