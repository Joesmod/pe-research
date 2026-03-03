const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const meta = await sheets.spreadsheets.get({spreadsheetId: sid});
  const sheet = meta.data.sheets.find(s => s.properties.title === 'Replied / Active');
  const sheetId = sheet.properties.sheetId;

  // 1. Add two new rows
  await sheets.spreadsheets.values.append({
    spreadsheetId: sid,
    range: 'Replied / Active!A:J',
    valueInputOption: 'USER_ENTERED',
    resource: {values: [
      ['Jeff Patterson Referral', '', '', '', 'Referral (Jeff Patterson via Jeff C)', '2026-02-25', 'New Lead', 'Fitness + asian medicine + herbal medicine + crypto + lifestyle wellbeing. Site fully built, needs someone to scale it. Jeff P offered intro.', 'Jeff C to set intro call with Jeff Patterson', 'Jeff'],
      ['Growth X', 'Growth X', '', '', 'Outbound', '2026-02-25', 'Proposal Sent', 'Proposal is out, waiting for their reply.', 'Await reply on proposal', 'Jeff']
    ]}
  });
  console.log('2 rows added');

  // 2. Widen columns A-J
  const widths = [180, 160, 220, 220, 200, 110, 140, 350, 250, 100];
  const requests = widths.map((w, i) => ({
    updateDimensionProperties: {
      range: {sheetId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1},
      properties: {pixelSize: w},
      fields: 'pixelSize'
    }
  }));

  await sheets.spreadsheets.batchUpdate({spreadsheetId: sid, resource: {requests}});
  console.log('Columns widened');
}

run().catch(e => { console.error(e); process.exit(1); });
