const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  const meta = await sheets.spreadsheets.get({spreadsheetId: sid});
  const sheet = meta.data.sheets.find(s => s.properties.title === 'Replied / Active');
  const sheetId = sheet.properties.sheetId;

  // Updated notes with both sides chronologically
  const notes = {
    'Sherif Barrad': '- 2/19: We sent cold email to Sherif (Advisory Director of AI)\n- 2/19: Sherif replied requesting capabilities deck, assistant Sarah to schedule 30min mid-March',
    'David Hook': '- 2/25: We sent cold email to David Hook (Managing Director)\n- 2/25: David replied "interested in buying your company"\n- 2/25: David followed up "please call"\n- 2/25: Team flagged as likely spam/acquisition fishing',
    'Scott Kraege': '- 2/17: Steve forwarded Centerfield Capital referral\n- 2/24: Scott replied offering to share Gumbo overview with PE firm contact (analyst friend)\n- 2/24: Steve responded, discussing portfolio review and intros',
    'Knox Lane': '- 2/18: We sent cold email to Tommy Richardson\n- 2/18: Michele (EA) responded, began scheduling\n- 2/19: Tommy canceled original call, asked to reschedule\n- 2/19: Michele proposed week of 3/10\n- 2/20: Steve confirmed 3/11 afternoon\n- 2/20: Michele sent Zoom invite for 3/11 1pm ET',
    'Rainmaker': '- 2/25: Engagement via welcome.jpeg\n- 2/25: Jeff flagged as new lead',
    'Jeff Patterson': '- 2/25: Jeff Patterson reached out to Jeff C with referral\n- 2/25: Client has fully built fitness/asian medicine/crypto/lifestyle site, needs scaling help\n- 2/25: Jeff P offered to set intro',
    'Growth X': '- Proposal sent to Growth X\n- 2/25: Awaiting their reply'
  };

  const updates = [];
  const res = await sheets.spreadsheets.values.get({spreadsheetId: sid, range: 'Replied / Active!A2:A20'});
  const rows = res.data.values || [];
  
  for (let i = 0; i < rows.length; i++) {
    const name = rows[i][0] || '';
    const key = Object.keys(notes).find(k => name.toLowerCase().includes(k.toLowerCase()));
    if (key) {
      updates.push({range: `Replied / Active!H${i+2}`, values: [[notes[key]]]});
    }
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sid,
    resource: {valueInputOption: 'USER_ENTERED', data: updates}
  });
  console.log(`Updated ${updates.length} notes`);

  // Wrap text on Next Step column (I = index 8) and Notes column (H = index 7)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sid,
    resource: {requests: [
      {repeatCell: {
        range: {sheetId, dimension: 'COLUMNS', startColumnIndex: 7, endColumnIndex: 9, startRowIndex: 1, endRowIndex: 100},
        cell: {userEnteredFormat: {wrapStrategy: 'WRAP'}},
        fields: 'userEnteredFormat.wrapStrategy'
      }},
      // Also widen Next Step column a bit more
      {updateDimensionProperties: {
        range: {sheetId, dimension: 'COLUMNS', startIndex: 8, endIndex: 9},
        properties: {pixelSize: 300},
        fields: 'pixelSize'
      }}
    ]}
  });
  console.log('Wrap text enabled on Notes + Next Step columns');
}

run().catch(e => { console.error(e); process.exit(1); });
