const { google } = require('googleapis');

async function checkMoreLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = result.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('=== ADDITIONAL LEADS NEEDING ENRICHMENT ===');
  console.log('');
  
  let count = 0;
  for (let i = 1; i < rows.length && count < 30; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (!company) continue; // Skip empty rows
    
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|hello|admin|compliance|press|careers)@/i);
    const needsEnrichment = !contactName || !email || hasGenericEmail;
    
    if (needsEnrichment && status !== 'Enriched' && status !== 'Researched - No Public Email') {
      console.log(`Row ${i+1}: ${company}`);
      console.log(`  Contact: '${contactName}' | Email: '${email}' | Status: '${status}'`);
      console.log('');
      count++;
    }
  }
  
  if (count === 0) {
    console.log('No additional leads found needing enrichment.');
    console.log('');
    console.log('=== RECENTLY ADDED LEADS ===');
    // Show last 10 entries
    for (let i = Math.max(1, rows.length - 15); i < rows.length; i++) {
      const row = rows[i];
      const company = row[0] || '';
      const contactName = row[2] || '';
      const status = row[7] || '';
      
      if (company) {
        console.log(`Row ${i+1}: ${company} | Contact: '${contactName}' | Status: '${status}'`);
      }
    }
  }
}

checkMoreLeads().catch(console.error);
