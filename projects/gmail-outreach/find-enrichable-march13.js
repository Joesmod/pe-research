const { google } = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:O1000'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  const firmCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const websiteCol = headers.indexOf('Website');
  const statusCol = headers.indexOf('Status');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const website = row[websiteCol] || '';
    const status = row[statusCol] || '';
    
    if (!firm) continue; // Skip empty rows
    
    const isGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('inquiries@') ||
      email.toLowerCase().includes('hello@') ||
      email.toLowerCase().includes('team@')
    );
    
    const isEmpty = !contact || !email;
    
    if (isEmpty || isGenericEmail) {
      needsEnrichment.push({
        rowNum: i + 1,
        firm,
        contact,
        email,
        website,
        status
      });
    }
  }
  
  console.log(`🔍 Found ${needsEnrichment.length} firms needing enrichment:\n`);
  console.log('='.repeat(120));
  
  needsEnrichment.slice(0, 15).forEach(lead => {
    console.log(`Row ${lead.rowNum}: ${lead.firm}`);
    console.log(`  Contact: '${lead.contact}'`);
    console.log(`  Email: '${lead.email}'`);
    console.log(`  Website: '${lead.website}'`);
    console.log(`  Status: '${lead.status}'`);
    console.log('');
  });
  
  if (needsEnrichment.length > 15) {
    console.log(`... and ${needsEnrichment.length - 15} more\n`);
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Total firms in sheet: ${rows.length - 1}`);
  console.log(`  Firms needing enrichment: ${needsEnrichment.length}`);
  console.log(`  Will enrich first 10-15`);
})().catch(console.error);
