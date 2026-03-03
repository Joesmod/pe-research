const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  const res = await sheets.spreadsheets.values.get({spreadsheetId: sid, range: 'Tracker!A2:A20'});
  const rows = res.data.values || [];
  let idx = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][0] || '').toLowerCase().includes('growth')) { idx = i; break; }
  }
  if (idx === -1) { console.log('Not found'); return; }
  const row = idx + 2;

  const notes = [
    '- 1/30: Ben Bastian (GrowthX) proposed meeting times',
    '- 2/1: Steve confirmed 2-3pm ET call for 2/4',
    '- 2/4: Call with Andrew Goldner + Ben; Steve sent proposal deck',
    '- 2/6: Andrew replied - reviewing internally, ASAP priority',
    '- 2/11: Steve checked in; mentioned travel, Jeff to handle',
    '- 2/12: Andrew said conversations ongoing, will circle back with questions',
    '- 2/18: Jeff followed up, team available async'
  ].join('\n');

  const nextStep = "Gumbo waiting for GrowthX reply on proposal (they said they'd circle back with questions)";
  const source = "Referral (colleague of Steve's)";

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sid,
    resource: {valueInputOption: 'USER_ENTERED', data: [
      {range: `Tracker!E${row}`, values: [[source]]},
      {range: `Tracker!H${row}`, values: [[notes]]},
      {range: `Tracker!I${row}`, values: [[nextStep]]}
    ]}
  });
  console.log('Updated Growth X row', row);
}

run().catch(e => { console.error(e); process.exit(1); });
