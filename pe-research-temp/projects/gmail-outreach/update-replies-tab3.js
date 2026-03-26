const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});

async function run() {
  const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Read current data to find row positions
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sid,
    range: 'Replied / Active!A1:J20'
  });
  const rows = res.data.values || [];
  console.log('Current rows:', rows.length);
  rows.forEach((r, i) => console.log(`  ${i}: ${r[0]} | ${r[1]}`));

  // Notes = col H (index 7), Next Step = col I (index 8)
  // Row 1 = header, data starts row 2
  const updates = [];

  for (let i = 1; i < rows.length; i++) {
    const name = (rows[i][0] || '').toLowerCase();
    let notes, nextStep;

    if (name.includes('sherif')) {
      notes = '- Cold email sent 2/19\n- Sherif responded 2/19 requesting capabilities deck\n- Sarah (EA) scheduling 30min mid-March';
      nextStep = 'Reply w/ capability deck to lock in March meeting';
    } else if (name.includes('david hook')) {
      notes = '- Cold email sent 2/25\n- David replied 2/25: "interested in buying your company"\n- Second reply 2/25: "please call"\n- Team consensus: likely spam/acquisition fishing';
      nextStep = 'Hold - do NOT respond. Team monitoring.';
    } else if (name.includes('scott') || name.includes('centerfield')) {
      notes = '- Steve forwarded Centerfield Capital referral 2/17\n- Scott Kraege replied 2/24 offering PE firm intros\n- Steve engaged, discussing portfolio review';
      nextStep = 'Steve following up on intros + portfolio deep dive';
    } else if (name.includes('knox')) {
      notes = '- Cold email sent to Tommy Richardson\n- Michele (EA) coordinating scheduling\n- Original call canceled, rescheduled\n- Zoom confirmed 3/11 at 1pm ET';
      nextStep = 'Zoom intro call 3/11 1pm ET';
    } else if (name.includes('rainmaker')) {
      notes = '- welcome.jpeg engagement 2/25\n- Jeff flagged as new lead';
      nextStep = 'Jeff to provide context and next steps';
    } else if (name.includes('patterson')) {
      notes = '- Jeff Patterson reached out to Jeff C 2/25\n- Has client with fully built fitness/asian medicine/crypto/lifestyle site\n- Client needs someone to scale it\n- Jeff P offered to set intro';
      nextStep = 'Jeff C to set intro call with Jeff Patterson';
    } else if (name.includes('growth')) {
      notes = '- Proposal sent to Growth X\n- Awaiting reply as of 2/25';
      nextStep = 'Await reply on proposal';
    } else {
      continue;
    }

    const rowNum = i + 1;
    updates.push({range: `Replied / Active!H${rowNum}`, values: [[notes]]});
    updates.push({range: `Replied / Active!I${rowNum}`, values: [[nextStep]]});
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sid,
    resource: {valueInputOption: 'USER_ENTERED', data: updates}
  });
  console.log(`Updated ${updates.length / 2} rows with activity logs`);
}

run().catch(e => { console.error(e); process.exit(1); });
