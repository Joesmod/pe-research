const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  // Check Contacts sheet for rows without verified emails
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A1:I500'
  });
  const rows = res.data.values;
  console.log('Total contacts:', rows.length - 1);
  
  let noEmail = 0;
  let unverified = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const email = r[4] || '';
    const emailStatus = (r[5] || '').toLowerCase();
    if (!email) { noEmail++; continue; }
    if (emailStatus !== 'verified' && emailStatus !== 'valid') {
      unverified++;
      if (unverified <= 15) {
        console.log(`ROW ${i+1}: ${r[0]} | ${r[2]} | ${email} | status: ${r[5]||'NONE'}`);
      }
    }
  }
  console.log(`\nNo email: ${noEmail}, Unverified: ${unverified}`);
  
  // Also count Sheet1 stats
  const res2 = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!I2:I300'
  });
  const statuses = {};
  res2.data.values.forEach(r => { const s = r[0]||'empty'; statuses[s] = (statuses[s]||0)+1; });
  console.log('\nSheet1 status breakdown:', JSON.stringify(statuses));
}

run().catch(e => console.error(e.message));
