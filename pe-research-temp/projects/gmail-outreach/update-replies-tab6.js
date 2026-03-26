const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const res = await sheets.spreadsheets.values.get({spreadsheetId: sid, range: 'Replied / Active!A2:A20'});
  const rows = res.data.values || [];

  const nextSteps = {
    'Sherif Barrad': 'Gumbo waiting for Sarah (Charlesbank EA) to confirm March meeting time',
    'David Hook': 'Hold — do not respond. Team monitoring for further contact.',
    'Scott Kraege': 'Steve ping Scott to set intro with PE firm analyst friend',
    'Knox Lane': 'Attend Zoom intro call 3/11 at 1pm ET with Tommy Richardson',
    'Rainmaker': 'Jeff provide context on engagement and set next action',
    'Jeff Patterson': 'Jeff C connect with Jeff P to set intro with site owner',
    'Growth X': 'Gumbo waiting for Growth X reply on proposal'
  };

  const updates = [];
  for (let i = 0; i < rows.length; i++) {
    const name = rows[i][0] || '';
    const key = Object.keys(nextSteps).find(k => name.toLowerCase().includes(k.toLowerCase()));
    if (key) {
      updates.push({range: `Replied / Active!I${i+2}`, values: [[nextSteps[key]]]});
    }
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sid,
    resource: {valueInputOption: 'USER_ENTERED', data: updates}
  });
  console.log(`Updated ${updates.length} next steps`);
}

run().catch(e => { console.error(e); process.exit(1); });
