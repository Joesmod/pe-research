const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function run() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M300'
  });
  const rows = res.data.values;
  
  let count = 0;
  console.log('--- Rows needing enrichment (no email, not Dead/DUPLICATE) ---');
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const email = r[3] || '';
    const status = (r[8] || '');
    const hasRealEmail = email && email.includes('@') && !email.startsWith('http') && !/^(info@|sales@|ir@|contact@|deals@)/i.test(email);
    
    if (!hasRealEmail && !status.includes('DUPLICATE') && !status.includes('Dead Lead')) {
      console.log(`ROW ${i+1}: ${r[0]} | contact: ${r[1]||'NONE'} | email: ${email||'EMPTY'} | status: ${status}`);
      count++;
    }
  }
  console.log(`\nTotal needing enrichment: ${count}`);
  
  // Also check Contacts sheet
  const res2 = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A1:J5'
  });
  console.log('\nContacts sheet headers:', JSON.stringify(res2.data.values[0]));
}

run().catch(e => console.error(e.message));
