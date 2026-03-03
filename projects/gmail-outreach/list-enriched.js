const {google} = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({version: 'v4', auth});
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A:I'
  });

  const headers = res.data.values[0];
  const rows = res.data.values.slice(1);
  
  // Filter: has email (col D/index 3), Last Contacted (col I/index 8) is empty or not a timestamp
  const enriched = rows.filter(r => 
    r[3] && // has email
    (!r[8] || !r[8].startsWith('202')) // not contacted (no timestamp)
  );

  console.log(`Found ${enriched.length} enriched contacts not yet contacted\n`);
  
  enriched.slice(0,35).forEach((r, i) => {
    const company = r[0] || '?';
    const name = r[1] || '?';
    const title = r[2] || '?';
    const email = r[3] || '?';
    const score = r[7] || '?';
    console.log(`${i+1}. ${company} | ${name} (${title}) | ${email} | Score: ${score}`);
  });
  
})().catch(e => console.error(e));
