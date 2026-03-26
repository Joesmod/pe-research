const { google } = require('googleapis');

async function analyzeEnrichmentNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = result.data.values || [];
  const header = rows[0];
  
  console.log('ACTIVE FIRMS NEEDING ENRICHMENT:\n');
  console.log('(Excluding Dead Lead, DUPLICATE, Waiting on intro statuses)\n');
  
  let count = 0;
  for (let i = 1; i < rows.length && count < 20; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contactName = row[1] || '';
    const email = row[3] || '';
    const status = row[8] || '';
    
    // Skip dead/duplicate/waiting leads
    if (!status || status.match(/(Dead|DUPLICATE|Waiting|Contacted)/i) || firmName === '') continue;
    
    // Check if needs enrichment
    const needsContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && email.match(/^(info@|sales@|ir@|contact@|careers@)/i);
    const noEmail = !email || email.trim() === '';
    
    if (needsContact || hasGenericEmail || noEmail) {
      count++;
      console.log(`${count}. ${firmName}`);
      console.log(`   Contact: ${contactName || 'MISSING'}`);
      console.log(`   Email: ${email || 'MISSING'}`);
      console.log(`   Status: ${status || 'No Status'}`);
      console.log(`   Row: ${i + 1}`);
      console.log('');
    }
  }
  
  console.log(`\nTotal ACTIVE firms needing enrichment: ${count}`);
}

analyzeEnrichmentNeeds().catch(console.error);
