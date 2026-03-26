const { google } = require('googleapis');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Contacts!A:O',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  console.log('Total rows:', rows.length);
  console.log('Headers:', rows[0]);
  console.log('\nRows with empty/generic emails:');
  
  let count = 0;
  rows.slice(1).forEach((row, idx) => {
    const email = row[3] || '';
    const contactName = row[2] || '';
    const firm = row[0] || '';
    
    const isGeneric = email.match(/^(info@|sales@|ir@|contact@|hello@|support@)/i);
    const needsEnrichment = !contactName || !email || isGeneric;
    
    if (needsEnrichment && count < 20) {
      console.log(`\nRow ${idx + 2}: ${firm}`);
      console.log('  Contact:', contactName || '[EMPTY]');
      console.log('  Email:', email || '[EMPTY]');
      console.log('  Status:', row[6] || '[EMPTY]');
      count++;
    }
  });
  
  console.log(`\nFound ${count} leads needing enrichment`);
}

readSheet().catch(console.error);
