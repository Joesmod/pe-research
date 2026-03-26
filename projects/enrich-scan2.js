const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: 'projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  // Check Contacts sheet
  const res2 = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A1:L5'
  });
  console.log('Contacts headers:', JSON.stringify(res2.data.values[0]));
  console.log('Contacts sample:', JSON.stringify(res2.data.values[1]));
  
  const cres = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A1:L500'
  });
  const crows = cres.data.values || [];
  console.log('\nContacts total rows:', crows.length);
  
  // Count contacts without verified emails
  let noEmail = 0;
  for(let i=1; i<crows.length; i++) {
    const email = (crows[i][3] || '').trim();
    if(!email) noEmail++;
  }
  console.log('Contacts without email:', noEmail);
  
  // Also check: how many Sheet1 rows are "Enriched" but have NOT been contacted
  const res1 = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:M300'
  });
  const rows = res1.data.values || [];
  let enrichedNotContacted = 0;
  let contacted = 0;
  let enriched = 0;
  for(let i=1; i<rows.length; i++) {
    const status = (rows[i][8] || '').trim();
    const lastContacted = (rows[i][9] || '').trim();
    if(status === 'Enriched') enriched++;
    if(status === 'Enriched' && !lastContacted) enrichedNotContacted++;
    if(status === 'Contacted' || lastContacted) contacted++;
  }
  console.log('\nSheet1 stats:');
  console.log('Enriched:', enriched);
  console.log('Enriched not contacted:', enrichedNotContacted);
  console.log('Contacted:', contacted);
  
  // Show dead leads that have names but no emails - these are candidates for re-enrichment
  console.log('\n--- Dead leads WITH names (re-enrichment candidates) ---');
  let candidates = [];
  for(let i=1; i<rows.length; i++) {
    const r = rows[i];
    const status = (r[8] || '').trim();
    const name = (r[1] || '').trim();
    const email = (r[3] || '').trim();
    const score = parseInt(r[12] || '0');
    if(status === 'Dead Lead' && name && name !== 'Not identified' && !email && score >= 6) {
      candidates.push({row: i+1, company: r[0], name, score, website: r[4] || ''});
    }
  }
  candidates.sort((a,b) => b.score - a.score);
  candidates.slice(0, 15).forEach(c => console.log(`Row ${c.row}: ${c.company} (score ${c.score}) - ${c.name} - ${c.website}`));
})();
