const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const notes = {
    'Sherif Barrad': 
      '- 2/19: Jim sent cold email to Sherif Barrad (Advisory Director of AI, Charlesbank)\n' +
      '- 2/19: Sherif replied requesting capabilities deck, assistant Sarah to schedule 30min mid-March\n' +
      '- 2/25: Jeff followed up with capabilities PDF and request for March intro call',

    'David Hook': 
      '- 2/25: Jim sent cold email to David Hook (Managing Director, Baymark Partners)\n' +
      '- 2/25: David replied "We would be interested in buying your company. Interested?"\n' +
      '- 2/25: David followed up 16 min later with "Please call" (direct: 972-991-5457)\n' +
      '- 2/25: Team reviewed — consensus is likely spam/acquisition fishing. Jeff said hold, do not respond.',

    'Scott Kraege': 
      '- 2/17: Steve forwarded Centerfield Capital referral from Scott Kraege (scottkraege@gmail.com)\n' +
      '- 2/24: Steve replied to Scott, copied team, asked about portfolio and offered to dive in\n' +
      '- 2/24: Scott responded — offered to share Gumbo overview with friend at PE firm (sharp analyst who controls access)',

    'Knox Lane': 
      '- 2/18: Steve sent intro email to Tommy Richardson (Partner, Knox Lane)\n' +
      '- 2/18: Michele Cacchione (Sr. EA) responded, scheduled Zoom for 2/19\n' +
      '- 2/18: Michele moved call from 3pm to 4pm ET, Steve confirmed\n' +
      '- 2/19: Tommy canceled — conflict, asked to reschedule\n' +
      '- 2/19: Michele proposed week of 3/10 with availability options\n' +
      '- 2/19: Steve requested week of 3/10 instead (traveling to Australia/NZ)\n' +
      '- 2/20: Michele confirmed 3/11 at 1pm ET, sent Zoom invite\n' +
      '- 2/20: Steve confirmed 3/11 afternoon works',

    'Rainmaker': 
      '- 2/25: Engagement via welcome.jpeg\n' +
      '- 2/25: Jeff flagged as new lead to track',

    'Jeff Patterson': 
      '- 2/25: Jeff C received referral from buddy Jeff Patterson\n' +
      '- 2/25: Jeff P has a friend with fully built site (fitness + asian medicine + herbal medicine + crypto + lifestyle wellbeing)\n' +
      '- 2/25: Client needs someone to dedicate time to scaling the site\n' +
      '- 2/25: Jeff P offered to set intro between Jeff C and his friend',

    'Growth X': 
      '- Proposal sent to Growth X\n' +
      '- 2/25: Awaiting their reply on proposal'
  };

  const res = await sheets.spreadsheets.values.get({spreadsheetId: sid, range: 'Replied / Active!A2:A20'});
  const rows = res.data.values || [];
  const updates = [];

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
  console.log(`Updated ${updates.length} notes with full chronology`);
}

run().catch(e => { console.error(e); process.exit(1); });
