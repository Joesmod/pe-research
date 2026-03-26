const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'C:/Users/aljen/.openclaw/workspace-jim/projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});

  const updates = [
    // Tixel row 501: update status to "Warm Lead", add Co-Founder title, update notes
    { range: 'Sheet1!C501', values: [['Co-Founder']] },
    { range: 'Sheet1!I501', values: [['Warm Lead']] },
    { range: 'Sheet1!K501', values: [['Warm lead via Jeff Caldwell. Awaiting email intro to Steve. Updated 2026-02-27.']] },
    
    // Backstroke row 502: change from Dead Lead to Nurture
    { range: 'Sheet1!I502', values: [['Nurture']] },
    { range: 'Sheet1!K502', values: [['Historical lead from Jeff biz dev tracker. Status: Nurture per Jeff. Updated 2026-02-27.']] },
    
    // Satso row 503: change from Dead Lead to Nurture
    { range: 'Sheet1!I503', values: [['Nurture']] },
    { range: 'Sheet1!K503', values: [['Historical lead from Jeff biz dev tracker. Status: Nurture per Jeff. Updated 2026-02-27.']] },
    
    // Muse row 504: change from Dead Lead to Closed
    { range: 'Sheet1!I504', values: [['Closed']] },
    { range: 'Sheet1!K504', values: [['Historical lead from Jeff biz dev tracker. Status: Closed per Jeff. Updated 2026-02-27.']] },
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });

  console.log('Updated all 4 leads:');
  console.log('- Tixel: Warm Lead, added Co-Founder title');
  console.log('- Backstroke: Dead Lead → Nurture');
  console.log('- Satso: Dead Lead → Nurture');
  console.log('- Muse: Dead Lead → Closed');
}
main().catch(console.error);
