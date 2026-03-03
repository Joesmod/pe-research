const {google} = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({version: 'v4', auth});
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get Sheet1 to check company-level Last Contacted
  const sheet1Res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:K'
  });
  
  const sheet1Rows = sheet1Res.data.values.slice(1);
  const companyLastContacted = {};
  
  sheet1Rows.forEach(r => {
    const company = r[0]; // Company Name (col A)
    const lastContacted = r[9]; // Last Contacted (col J)
    if (company && lastContacted && lastContacted.startsWith('202')) {
      companyLastContacted[company.toLowerCase()] = lastContacted;
    }
  });
  
  console.log(`Sheet1: ${Object.keys(companyLastContacted).length} companies have Last Contacted timestamps\n`);
  
  // Get Contacts sheet
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Contacts!A:I'
  });

  const contactRows = contactsRes.data.values.slice(1);
  
  // Filter: has email, not contacted, company not recently contacted
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const eligible = contactRows.filter(r => {
    if (!r[3]) return false; // no email
    if (r[8] && r[8].startsWith('202')) return false; // already contacted
    
    const company = (r[0] || '').toLowerCase();
    const companyLastContact = companyLastContacted[company];
    
    if (companyLastContact) {
      const lastContactDate = new Date(companyLastContact);
      if (lastContactDate > oneWeekAgo) {
        return false; // contacted within last week
      }
    }
    
    return true;
  });
  
  console.log(`${eligible.length} contacts are eligible (enriched, not contacted, company not contacted in last 7 days)\n`);
  
  // Prioritize by score (col H / index 7), then shuffle for variety
  const scored = eligible.filter(r => r[7]).sort((a,b) => {
    const scoreA = parseInt(a[7]) || 0;
    const scoreB = parseInt(b[7]) || 0;
    return scoreB - scoreA;
  });
  
  // ONE CONTACT PER COMPANY - pick best from each
  const seenCompanies = new Set();
  const top25 = [];
  
  for (const row of scored) {
    const company = (row[0] || '').toLowerCase();
    if (!seenCompanies.has(company)) {
      seenCompanies.add(company);
      top25.push(row);
      if (top25.length >= 25) break;
    }
  }
  
  console.log('=== TOP 25 CONTACTS FOR OUTREACH ===\n');
  top25.forEach((r, i) => {
    const company = r[0] || '?';
    const name = r[1] || '?';
    const title = r[2] || '?';
    const email = r[3] || '?';
    const linkedin = r[5] || '';
    const score = r[7] || '?';
    
    console.log(`${i+1}. ${company}`);
    console.log(`   ${name} - ${title}`);
    console.log(`   ${email}`);
    console.log(`   Score: ${score}`);
    if (linkedin) console.log(`   LinkedIn: ${linkedin}`);
    console.log('');
  });
  
})().catch(e => console.error(e));
