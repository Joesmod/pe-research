const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

async function run() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values || [];
  const headers = rows[0];
  
  console.log('📋 Headers:', headers);
  console.log(`\n📊 Total rows: ${rows.length - 1}`);
  
  // Show first 5 rows
  console.log('\n🔍 First 5 rows:');
  for (let i = 1; i <= Math.min(5, rows.length - 1); i++) {
    const row = rows[i];
    console.log(`\nRow ${i + 1}:`);
    headers.forEach((header, idx) => {
      if (row[idx]) {
        console.log(`  ${header}: ${row[idx]}`);
      }
    });
  }
  
  // Find rows with empty/generic emails
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = { rowNumber: i + 1 };
    headers.forEach((header, idx) => {
      obj[header] = row[idx] || '';
    });
    
    const email = obj.Email?.toLowerCase().trim() || '';
    const contactName = obj['Contact Name']?.trim() || '';
    const status = obj.Status?.toLowerCase().trim() || '';
    
    if (status === 'enriched' || status === 'sent' || status === 'dead') continue;
    
    const isGeneric = email.startsWith('info@') || email.startsWith('sales@') || 
                     email.startsWith('ir@') || email.startsWith('contact@');
    
    if (!contactName || !email || isGeneric) {
      needsEnrichment.push(obj);
    }
  }
  
  console.log(`\n\n🎯 Rows needing enrichment: ${needsEnrichment.length}`);
  console.log('\nFirst 10 that need enrichment:');
  needsEnrichment.slice(0, 10).forEach(row => {
    console.log(`\nRow ${row.rowNumber}: ${row['PE Firm']}`);
    console.log(`  Contact: ${row['Contact Name'] || '(empty)'}`);
    console.log(`  Email: ${row.Email || '(empty)'}`);
    console.log(`  Status: ${row.Status || '(empty)'}`);
  });
}

run().catch(console.error);
