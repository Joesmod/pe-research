const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:J100'
  });
  
  const rows = res.data.values;
  if (!rows) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Column mapping:');
  headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
  
  console.log('\n\nFirms needing enrichment:\n' + '='.repeat(120));
  
  let needsEnrichmentCount = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[0] || '';
    const notebookLM = row[1] || '';
    const contactName = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const linkedin = row[6] || '';
    const status = row[9] || '';
    
    // Check for various enrichment needs
    const missingContact = !contactName || contactName.startsWith('http');
    const missingEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@');
    const missingTitle = !title || title.startsWith('http');
    const emailLooksWrong = email && !email.includes('@');
    
    if ((missingContact || missingEmail || missingTitle || emailLooksWrong) && firm) {
      needsEnrichmentCount++;
      console.log(`\nRow ${i+1}: ${firm}`);
      console.log(`  Status: ${status}`);
      console.log(`  Issues:`);
      if (missingContact) console.log(`    - Missing/invalid Contact Name: '${contactName}'`);
      if (missingTitle) console.log(`    - Missing/invalid Title: '${title}'`);
      if (missingEmail) console.log(`    - Missing/generic Email: '${email}'`);
      if (emailLooksWrong) console.log(`    - Email format issue: '${email}'`);
      console.log(`  Website: ${website}`);
      console.log(`  LinkedIn: ${linkedin}`);
    }
  }
  
  console.log(`\n\nTotal firms needing enrichment: ${needsEnrichmentCount}`);
})();
