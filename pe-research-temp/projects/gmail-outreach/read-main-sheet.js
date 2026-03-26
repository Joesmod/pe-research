const { google } = require('googleapis');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read Sheet1
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = result.data.values || [];
  if (rows.length > 0) {
    console.log('Headers:', rows[0]);
    console.log(`Total rows: ${rows.length}`);
    console.log('\nFirst 5 data rows:');
    rows.slice(1, 6).forEach((row, idx) => {
      console.log(`Row ${idx + 2}:`, row);
    });
    
    // Find rows with empty Contact Name or generic emails
    console.log('\n--- Leads needing enrichment ---');
    let needsEnrichment = 0;
    rows.slice(1).forEach((row, idx) => {
      const company = row[0] || '';
      const contact = row[2] || '';
      const email = row[3] || '';
      const status = row[6] || '';
      
      const isGenericEmail = email.match(/^(info@|sales@|ir@|contact@|admin@)/i);
      const needsWork = !contact || !email || isGenericEmail;
      
      if (needsWork && status !== 'Dead' && status !== 'Bounced') {
        needsEnrichment++;
        if (needsEnrichment <= 20) {
          console.log(`Row ${idx + 2}: ${company} | Contact: "${contact}" | Email: "${email}" | Status: ${status}`);
        }
      }
    });
    console.log(`\nTotal needing enrichment: ${needsEnrichment}`);
  }
}

readSheet().catch(console.error);
