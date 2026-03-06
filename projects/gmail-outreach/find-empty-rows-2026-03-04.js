const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function findEmptyRows() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values || [];
  const emptyRows = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[0];
    const contactName = row[2];
    const email = row[4];
    
    if (!firmName || firmName.trim() === '' || firmName === '(empty)') {
      continue;
    }
    
    const needsEnrichment = 
      !contactName || contactName === '(empty)' || contactName.trim() === '' ||
      !email || email === '(empty)' || email.trim() === '' ||
      email.startsWith('info@') || 
      email.startsWith('sales@') ||
      email.startsWith('ir@') ||
      email.startsWith('contact@');
    
    if (needsEnrichment) {
      emptyRows.push({
        rowNum: i + 1,
        firmName,
        contactName: contactName || '(empty)',
        email: email || '(empty)'
      });
    }
  }
  
  console.log(`Found ${emptyRows.length} rows needing enrichment:\n`);
  emptyRows.slice(0, 50).forEach(r => {
    console.log(`Row ${r.rowNum}: ${r.firmName} | Contact: ${r.contactName} | Email: ${r.email}`);
  });
}

findEmptyRows().catch(console.error);
