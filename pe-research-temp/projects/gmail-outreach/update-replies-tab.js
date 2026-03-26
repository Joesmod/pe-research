const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const meta = await sheets.spreadsheets.get({spreadsheetId: sid});
  const sheet = meta.data.sheets.find(s => s.properties.title === 'Replied / Active');
  const sheetId = sheet.properties.sheetId;

  // Add Rainmaker row
  await sheets.spreadsheets.values.append({
    spreadsheetId: sid,
    range: 'Replied / Active!A:J',
    valueInputOption: 'USER_ENTERED',
    resource: {values: [['Rainmaker', 'Rainmaker', '', '', 'Inbound (welcome.jpeg engagement)', '2026-02-25', 'New Lead', 'Engaged via welcome.jpeg. Details TBD from Jeff.', 'Follow up - get context from Jeff', 'Jeff']]}
  });
  console.log('Rainmaker row added');

  // Format header: bold, gray bg, freeze row 1
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sid,
    resource: {
      requests: [
        {
          repeatCell: {
            range: {sheetId, startRowIndex: 0, endRowIndex: 1},
            cell: {userEnteredFormat: {backgroundColor: {red: 0.85, green: 0.85, blue: 0.85}, textFormat: {bold: true}}},
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        },
        {
          updateSheetProperties: {
            properties: {sheetId, gridProperties: {frozenRowCount: 1}},
            fields: 'gridProperties.frozenRowCount'
          }
        }
      ]
    }
  });
  console.log('Header formatted (bold, gray bg, frozen)');
}

run().catch(e => { console.error(e); process.exit(1); });
