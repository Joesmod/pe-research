const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const meta = await sheets.spreadsheets.get({spreadsheetId: sid});
  const sheet = meta.data.sheets.find(s => s.properties.title === 'Replied / Active');
  const sheetId = sheet.properties.sheetId;

  // Delete rows 6-8 (0-indexed: 5-7) — the duplicates of David Hook, Scott Kraege, Knox Lane
  // Must delete from bottom up
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sid,
    resource: {
      requests: [{
        deleteDimension: {
          range: {sheetId, dimension: 'ROWS', startIndex: 5, endIndex: 8}
        }
      }]
    }
  });
  console.log('Deleted duplicate rows 6-8');

  // Verify
  const res = await sheets.spreadsheets.values.get({spreadsheetId: sid, range: 'Replied / Active!A1:J20'});
  (res.data.values || []).forEach((r, i) => console.log(`  ${i}: ${r[0]}`));
}

run().catch(e => { console.error(e); process.exit(1); });
