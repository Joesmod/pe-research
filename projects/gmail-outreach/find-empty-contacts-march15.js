const { google } = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:N1000'
  });

  const rows = r.data.values;
  let emptyOrGeneric = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const websiteAlt = (row[5] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company) continue;
    if (status.toLowerCase().includes('dead')) continue;
    if (status.toLowerCase() === 'enriched' && contactName && email) continue;
    
    // Find rows with NO contact name or generic emails
    const needsContact = !contactName || contactName.length < 3 || contactName.match(/^(CEO|CFO|CTO|Partner|Director|VP|President|Principal|Managing|Founder)$/i);
    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@|support@)/i);
    
    if (needsContact || hasGenericEmail || !email) {
      emptyOrGeneric.push({
        row: i + 1,
        company,
        website: websiteAlt || website,
        contactName,
        email,
        status
      });
    }
  }

  console.log(`Found ${emptyOrGeneric.length} rows needing real contact names`);
  console.log('\nFirst 15:');
  emptyOrGeneric.slice(0, 15).forEach(item => {
    console.log(`\n[Row ${item.row}] ${item.company}`);
    console.log(`  Website: ${item.website || '(none)'}`);
    console.log(`  Contact: ${item.contactName || '(EMPTY)'}`);
    console.log(`  Email: ${item.email || '(EMPTY)'}`);
    console.log(`  Status: ${item.status}`);
  });
})();
