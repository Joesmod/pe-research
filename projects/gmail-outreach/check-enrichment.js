const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getAllData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L',
  });
  
  const rows = data.data.values;
  console.log('Total rows:', rows.length);
  console.log('\nNeeds enrichment (empty contact or generic email):');
  
  const needsEnrichment = [];
  rows.forEach((row, idx) => {
    if (idx === 0) return; // Skip header
    const company = row[0] || '';
    const contact = row[2] || '';
    const email = row[4] || '';
    const status = row[7] || '';
    
    if (!contact || !email || email.match(/^(info|sales|ir|contact|admin|general)@/i)) {
      console.log(`Row ${idx + 1}: ${company} | Contact: '${contact}' | Email: '${email}' | Status: '${status}'`);
      needsEnrichment.push({ row: idx + 1, company, contact, email, status });
    }
  });
  
  console.log(`\nTotal needing enrichment: ${needsEnrichment.length}`);
}

getAllData().catch(console.error);
