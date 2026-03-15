const { google } = require('googleapis');

async function analyzeSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  const header = rows[0];
  
  console.log('=== SHEET STRUCTURE ===');
  console.log('Headers:', header);
  console.log('\nTotal rows:', rows.length);
  
  // Find rows needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0] || '';
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = row[9] || '';
    
    // Skip if already marked as Dead/Not PE
    if (status.includes('Dead') || status.includes('Not PE')) continue;
    
    // Check for missing/generic emails
    const isGeneric = email && (
      email.includes('info@') || 
      email.includes('team@') ||
      email.includes('investors@') ||
      email.includes('ir@') ||
      email.includes('sales@')
    );
    
    const needsWork = !contactName || !email || isGeneric || 
                      status.includes('Needs Manual') ||
                      status.includes('Contact Found - Needs Email') ||
                      status === 'New - Unresearched';
    
    if (needsWork && firmName) {
      needsEnrichment.push({
        row: i + 1,
        firm: firmName,
        contact: contactName,
        email: email,
        status: status,
        reason: !contactName ? 'No contact' : 
                !email ? 'No email' : 
                isGeneric ? 'Generic email' : status
      });
    }
  }
  
  console.log('\n=== FIRMS NEEDING ENRICHMENT (First 15) ===');
  needsEnrichment.slice(0, 15).forEach(f => {
    console.log(`${f.row}. ${f.firm} - ${f.reason}`);
    console.log(`   Current: ${f.contact || 'NONE'} / ${f.email || 'NONE'}`);
    console.log('');
  });
  
  console.log(`\nTotal firms needing work: ${needsEnrichment.length}`);
}

analyzeSheet().catch(console.error);
