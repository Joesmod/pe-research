const {google} = require('googleapis');
async function run() {
  const auth = new google.auth.GoogleAuth({keyFile: __dirname + '/service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Replied / Active!A:J',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        ['David Hook', 'Baymark Partners', '', 'dhook@baymarkpartners.com', 'Email (cold outreach)', '2026-02-25', 'Replied - Odd', 'MD at Baymark. First reply: wants to buy our company. Second reply: please call. Likely spam/deflection. All humans CCd.', 'Do NOT reply. Humans handling.', 'Jeff/Alex/Steve'],
        ['Scott Kraege', 'Centerfield Capital (referral)', '', 'scottkraege@gmail.com', 'Email (warm referral)', '2026-02-24', 'Warm Lead', 'Has friend at PE firm (analyst). Offered to share Gumbo overview and make intros. Steve replied.', 'Steve following up on intros', 'Steve'],
        ['Knox Lane (Tommy Richardson)', 'Knox Lane', '', 'trichardson@knoxlane.com', 'Email (cold outreach)', '2026-02-18', 'Meeting Scheduled', 'Zoom intro call rescheduled to 3/11 at 1pm ET. Michele Cacchione coordinating.', 'Zoom call 3/11 1pm ET', 'Steve']
      ]
    }
  });
  console.log('Added 3 rows to Replied / Active');
}
run().catch(e => console.error(e));
